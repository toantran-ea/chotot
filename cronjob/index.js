const scrapeIt = require('scrape-it');
const util = require('util');
const Async = require('async');
const chotot = require('./chotot');
const helper = require('./helper');


function getTopicLinks(html) {
  let result = scrapeIt.scrapeHTML(html, chotot.rules);
  return result.topics;
}

function process() {
  console.log('processing ....');
  var q = Async.queue(function(page, callback) {
      processItem(util.format(chotot.initURL, page), callback);
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
      helper.launchChrome(done);
    },
    (chrome, done) => {
      helper.getPageContents(url, chrome)
        .then(html => {
          return Promise.resolve(getTopicLinks(html));
        })
        .then(result => {
          let filteredPrices = result.filter(item => item.price <= chotot.filterPrice);
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

process();
