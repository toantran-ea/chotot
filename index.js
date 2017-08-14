// https://medium.com/@ariklevliber/real-world-website-scraping-and-cvs-exporting-using-the-new-headless-chromium-cea3e5611388

const scrapeIt = require('scrape-it');
const CDP = require('chrome-remote-interface');
const co = require('co');
const json2csv = require('json2csv');
const fs = require('fs');
const moment =  require('moment-timezone');
const upperPrice = 2500000000; // 2.5bil
const util = require('util');
const Async = require('async');
const chromeLauncher = require('chrome-launcher');
// const chotot_binhthanh = 'https://nha.chotot.com/tp-ho-chi-minh/quan-binh-thanh/mua-ban-nha-dat?f=p&page=1&sp=0';
const chotot_binhthanh = 'https://nha.chotot.com/tp-ho-chi-minh/quan-binh-thanh/mua-ban-nha-dat?page=%d'
const baseUrl = 'https://nha.chotot.com';

moment().tz("Asia/Ho_Chi_Minh").format();

function getPageContents(url, chromeInstance) {
  console.log('working on ', url);
  return new Promise((resolve, reject) => {
    CDP({port: chromeInstance.port}, client => {
      const {Page, Runtime} = client;

      Page.loadEventFired(() => {
        setTimeout(() => {
          Runtime.evaluate({expression: 'document.body.outerHTML'}).then((result) => {
            resolve(result.result.value);
            client.close();
            chromeInstance.kill();
          });
        }, 3000);
      });

      // Enable events on domains we are interested in
      Page.enable().then(() => {
        return Page.navigate({url});
      });
    }).on('error', err => {
      console.error('getPageContents: cannot connect to browser', err);
      chromeInstance.kill();
      reject();
    });
  });
}

function getTopicLinks(html) {
  let result = scrapeIt.scrapeHTML(html, {
    topics: {
      listItem: '._10fX327FTBhXxwannc1Gp_',
      data: {
        link: {
          selector: '._2-QpDA4ooHCnxpPjIDiUYD',
          attr: 'href',
          convert: path => fullUrl(path)
        },
        price: {
            selector: '.rbUN6Vaz5gMZ1qei6Mbrq',
            attr: 'content'
        },
        date: {
            selector: '.XXGpZ-FP2JDUEL80ZK7ZE',
            attribute: 'content',
            convert: raw => parseDate(raw)
        },
        phone: {
          select: '#sms_btn',
          attribute: 'href',
          convert: raw => getPhoneNumber(raw)
        }
      }
    }
  });
  return result.topics;
}

function getPhoneNumber(rawSMS) {
    return rawSMS.split(':')[1];
}

function parseDate(rawDate) {
  const today = 'hôm nay';
  const yesterday = 'hôm qua';
  const dateComponent = rawDate.split('|')[0];
  const timeReg = /([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]/i;
  let date = moment().toDate();
  date.setSeconds(0);
  date.setMilliseconds(0);
  let matchedTime = rawDate.match(timeReg);
  let time = '--:--';
  if(matchedTime) {
    let timeStr = rawDate.slice(matchedTime.index, rawDate.length);
    let hours = parseInt(timeStr.split(':')[0]);
    let minutes = parseInt(timeStr.split(':')[1]);
    date.setHours(hours);
    date.setMinutes(minutes);
  }
  if(dateComponent.startsWith(today)) {
    // do nothing
  } else if(dateComponent.startsWith(yesterday)) {
    let dateMoment = new moment(date);
    date = moment().subtract(1, 'days').toDate();
  } else { // another date
    date = setCustomDate(date, rawDate.slice(0, matchedTime.index -1));
  }
  return date;
}

function setCustomDate(date, customRawDate) {
  //  **07 tháng 06** 14:08
  let customDate = moment(date).toDate();
  const monthSpliter = 'tháng';
  const dateStr = customRawDate.split(monthSpliter)[0].trim();
  const monthStr = customRawDate.split(monthSpliter)[1].trim();
  customDate.setMonth(parseInt(monthStr));
  customDate.setDate(parseInt(dateStr));
  return customDate;
}

function fullUrl(shortUrl) {
  return `${baseUrl}${shortUrl}`;
}

function process() {
  console.log('processing ....');
  var q = Async.queue(function(page, callback) {
      processItem(util.format(chotot_binhthanh, page), callback);
  }, 10);

    // assign a callback
  q.drain = function() {
      console.log('all items have been processed');
  };

  const pages = Array(10).fill().map((x,i)=> i + 1);
  pages.forEach(page => {
    q.push(page, err => {
       console.log('Finished processing page#', page);
    });
  });
}

function processItem(url, cb) {
  console.log('processing url: ' + url);
  Async.waterfall([done => {
      launchChrome(done);
    },
    (chrome, done) => {
      getPageContents(url, chrome)
        .then(html => {
          return Promise.resolve(getTopicLinks(html));
        })
        .then(result => {
          let filteredPrices = result.filter(item => item.price <= upperPrice);
          done(null, filteredPrices);
        }).catch(err => {
          done(err);
        });
    }], (err, result) => {
      console.error(err);
      console.log(result);
      cb(err);
    });
  };

function launchChrome(cb) {
  const chromeLauncher = require('chrome-launcher');

  chromeLauncher.launch({
    chromeFlags: ['--headless', '--disable-gpu']
  }).then(chrome => {
    console.log(`Chrome debugging port running on ${chrome.port}`);
    cb(null, chrome);
  }).catch(err => {
    console.error(`Error launching chrome ${err}`);
    cb(err);
  }) ;
}

process();
