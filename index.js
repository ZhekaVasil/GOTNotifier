require('dotenv').config();
const rp = require('request-promise');
const cheerio = require('cheerio');
const shell = require('shelljs');
const config = require('./config');
const exec = require('child_process').exec;
const Twilio = require('./twilio');

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
    exec(`http-server -p ${config.appPort}`)
  }

  checkNewEoisode() {
    console.log('Creating new request ', new Date());
    rp({
      uri: this.uri,
      transform: this.transform
    })
      .then(async ($) => {
      if (this.isEpisodeAvailabel($)) {
        this.showBrowserNotification();
        try {
          await this.sendSMSNotification();
        } finally {
          process.exit(0);
        }
      } else {
        console.log('There is no new episode yet');
        setTimeout(() => {this.checkNewEoisode()}, this.checkInterval)
      }
    })
      .catch((error) => {
        console.log(error);
        setTimeout(() => {this.checkNewEoisode()}, this.checkInterval)
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

  isEpisodeAvailabel($) {
    return !$('.movie-parts-list td')
      .filter((i, el) => this.getEpisodeNumber($(el).text()) === this.episodeNumber && (this.setEpisodeTitle($(el).next().html()) || true))
      .closest('tr')
      .hasClass('not-available')
  }
}

const lostFilm = new LostFilm();

lostFilm.checkNewEoisode();