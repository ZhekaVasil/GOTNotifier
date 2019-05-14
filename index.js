const rp = require('request-promise');
const cheerio = require('cheerio');
const shell = require('shelljs');
const config = require('./config');
const exec = require('child_process').exec;

class LostFilm {
  constructor() {
    this.uri = config.siteURL;
    this.checkInterval = config.checkInterval;
    this.episodeName = config.episodeName
  }

  transform(body) {
    return cheerio.load(body);
  }

  showNotification() {
    this.runServer();
    shell.exec('script.sh')
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
      .then(($) => {
      if (this.isEpisodeAvailabel($)) {
        this.showNotification();
        process.exit(0);
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

  isEpisodeAvailabel($) {
    return !$('.movie-parts-list td').filter((i, el) => $(el).text().includes(this.episodeName)).closest('tr').hasClass('not-available')
  }
}

const lostFilm = new LostFilm();

lostFilm.checkNewEoisode();