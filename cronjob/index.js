const scrapeIt = require('scrape-it')
const util = require('util')
const Async = require('async')
const chotot = require('./chotot')
const helper = require('./helper')
const Property = require('../database').Property
const BinhThanh = chotot.districts.dist_binh_thanh.url

function getTopicLinks (html) {
  let result = scrapeIt.scrapeHTML(html, chotot.rules)
  return result.topics
}

function process () {
  console.log('processing ....')
  var q = Async.queue(function (page, callback) {
    processItem(util.format(chotot.initURL, BinhThanh, page), callback)
  }, 10)

    // assign a callback
  q.drain = function () {
    console.log('all items have been processed')
  }

  const pages = Array(1).fill().map((x, i) => i + 1)
  pages.forEach(page => {
    q.push(page, err => {
      console.log('Finished processing page#', page)
      if (err) {
        console.error('Error on processing page #', page, err)
      }
    })
  })
}

function processItem (url, cb) {
  console.log('processing url: ' + url)
  Async.waterfall([done => {
    helper.launchChrome(done)
  },
    (chrome, done) => {
      helper.getPageContents(url, chrome)
        .then(html => {
          return Promise.resolve(getTopicLinks(html))
        })
        .then(result => {
          done(null, result)
        }).catch(err => {
          done(err)
        })
    }], (err, result) => {
    if (err) {
      return console.error(err)
    }
    console.log(result)
    storeToDB(result)
    cb(err)
  })
}

function storeToDB (allResults) {
  console.log('storing into database ...')
  var q = Async.queue(function storeItem (crawlResultIem, callback) {
    Property.create({
      link: crawlResultIem.link,
      price: crawlResultIem.price,
      date: crawlResultIem.date,
      phone: crawlResultIem.phone,
      shortDescription: crawlResultIem.shortDescription
    }, (err, storedItem) => {
      if (err) {
        console.error(err)
      }
      callback(err)
    })
  }, 10)

   // assign a callback
  q.drain = function () {
    console.log('all items have been processed')
  }

  allResults.forEach(item => {
    q.push(item, err => {
      console.log('Finished inserting page#', item.link)
      if (err) {
        console.error('Error on inserting page #', item.link, err)
      }
    })
  })
}

process()
