require('dotenv').config();
const rp = require('request-promise');
const cheerio = require('cheerio');
const shell = require('shelljs');
const config = require('./config');
const exec = require('child_process').exec;
const Twilio = require('./twilio');
const http = require('http');

class LostFilm {
  constructor() {
    this.uri = config.siteURL;
    this.checkInterval = config.checkInterval;
    this.episodeNumber = config.episodeNumber;
    this.episodeTitle = '';
  }

  transform(body) {
    return cheerio.load(body, {decodeEntities: false});
  }

  showBrowserNotification() {
    this.runServer();
    const base64Message = Buffer.from(this.newEpisodeMessage).toString('base64');
    shell.exec(`script.sh ${base64Message}`)
  }

  sendSMSNotification() {
    const twilio = new Twilio();
    return twilio.sendMessage(this.newEpisodeMessage)
  }

  runServer() {
    console.log('port: ', process.env.APP_PORT);
    /*http.createServer(function (req, res) {
      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.end('GoT Notifier');
    }).listen(process.env.APP_PORT, 'localhost');*/
    exec(`http-server -p ${process.env.APP_PORT}`)
  }

  checkNewEpisode() {
    console.log('Creating new request ', new Date());
    rp({
      uri: this.uri,
      transform: this.transform
    })
      .then(async ($) => {
      if (this.isEpisodeAvailable($)) {
        // this.showBrowserNotification();
        try {
          await this.sendSMSNotification();
          // process.exit(0);
          shell.exec(`pm2 stop index`)
        } catch {
          console.log('Can not send SMS, re-try...');
          setTimeout(() => {this.checkNewEpisode()}, this.checkInterval)
        }
      } else {
        console.log('There is no new episode yet');
        setTimeout(() => {this.checkNewEpisode()}, this.checkInterval)
      }
    })
      .catch((error) => {
        console.log(error);
        setTimeout(() => {this.checkNewEpisode()}, this.checkInterval)
      })
  }

  getEpisodeNumber(text) {
    return text.replace(/сезон|серия|\s/gi, '')
  }

  get newEpisodeMessage() {
    return `New episode of GoT - "${this.episodeTitle}" is available`
  }

  setEpisodeTitle(html) {
    this.episodeTitle = html.replace(/<.*?>|&nbsp;/gi, ' ').replace(/\s+/g, ' ').trim();
  }

  isEpisodeAvailable($) {
    console.log(this.episodeNumber);
    const tdElement = $('.movie-parts-list td')
      .filter((i, el) => this.getEpisodeNumber($(el).text()) === this.episodeNumber && (this.setEpisodeTitle($(el).next().html()) || true));

    return tdElement.length ? !tdElement.closest('tr').hasClass('not-available') : false
  }
}

const lostFilm = new LostFilm();

lostFilm.runServer();
lostFilm.checkNewEpisode();