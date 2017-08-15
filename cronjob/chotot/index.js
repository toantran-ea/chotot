const baseUrl = 'https://nha.chotot.com'
const Moment = require('moment-timezone')

exports = module.exports = {
  initURL: 'https://nha.chotot.com/tp-ho-chi-minh/quan-binh-thanh/mua-ban-nha-dat?page=%d',
  rules: {
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
  },
  filterPrice: 2500000000
}

function getPhoneNumber (rawSMS) {
  return rawSMS.split(':')[1]
}

function parseDate (rawDate) {
  const today = 'hôm nay'
  const yesterday = 'hôm qua'
  const dateComponent = rawDate.split('|')[0]
  const timeReg = /([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]/i
  let date = Moment().toDate()
  date.setSeconds(0)
  date.setMilliseconds(0)
  let matchedTime = rawDate.match(timeReg)
  if (matchedTime) {
    let timeStr = rawDate.slice(matchedTime.index, rawDate.length)
    let hours = parseInt(timeStr.split(':')[0])
    let minutes = parseInt(timeStr.split(':')[1])
    date.setHours(hours)
    date.setMinutes(minutes)

    if (dateComponent.startsWith(today)) {
      // do nothing
    } else if (dateComponent.startsWith(yesterday)) {
      date = Moment().subtract(1, 'days').toDate()
    } else { // another date
      date = setCustomDate(date, rawDate.slice(0, matchedTime.index - 1))
    }
  } else {
    console.error('No matchedTime found!')
  }

  return date
}

function setCustomDate (date, customRawDate) {
  //  **07 tháng 06** 14:08
  let customDate = Moment(date).toDate()
  const monthSpliter = 'tháng'
  const dateStr = customRawDate.split(monthSpliter)[0].trim()
  const monthStr = customRawDate.split(monthSpliter)[1].trim()
  customDate.setMonth(parseInt(monthStr))
  customDate.setDate(parseInt(dateStr))
  return customDate
}

function fullUrl (shortUrl) {
  return `${baseUrl}${shortUrl}`
}
