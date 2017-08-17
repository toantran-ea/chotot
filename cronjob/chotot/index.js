const baseUrl = 'https://nha.chotot.com'
const Moment = require('moment-timezone')

exports = module.exports = {
  initURL: 'https://nha.chotot.com%s?page=%d',
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
          convert: raw => parseDate(raw)
        },
        shortDescription: {
          selector: '.Gw4t5HfxzKaRjRHV9AVas'
        }
      }
    }
  },
  districts: {
    dist_1: {
      url: '/tp-ho-chi-minh/quan-1/mua-ban-nha-dat',
      label: 'Quận 1'
    },
    dist_2: {
      url: '/tp-ho-chi-minh/quan-2/mua-ban-nha-dat',
      label: 'Quận 2'
    },
    dist_3: {
      url: '/tp-ho-chi-minh/quan-3/mua-ban-nha-dat',
      label: 'Quận 3'
    },
    dist_4: {
      url: '/tp-ho-chi-minh/quan-4/mua-ban-nha-dat',
      label: 'Quận 4'
    },
    dist_5: {
      url: '/tp-ho-chi-minh/quan-5/mua-ban-nha-dat',
      label: 'Quận 5'
    },
    dist_6: {
      url: '/tp-ho-chi-minh/quan-6/mua-ban-nha-dat',
      label: 'Quận 6'
    },
    dist_7: {
      url: '/tp-ho-chi-minh/quan-7/mua-ban-nha-dat',
      label: 'Quận 7'
    },
    dist_8: {
      url: '/tp-ho-chi-minh/quan-8/mua-ban-nha-dat',
      label: 'Quận 8'
    },
    dist_9: {
      url: '/tp-ho-chi-minh/quan-9/mua-ban-nha-dat',
      label: 'Quận 9'
    },
    dist_10: {
      url: '/tp-ho-chi-minh/quan-10/mua-ban-nha-dat',
      label: 'Quận 10'
    },
    dist_11: {
      url: '/tp-ho-chi-minh/quan-11/mua-ban-nha-dat',
      label: 'Quận 11'
    },
    dist_12: {
      url: '/tp-ho-chi-minh/quan-12/mua-ban-nha-dat',
      label: 'Quận 12'
    },
    dist_binh_tan: {
      url: '/tp-ho-chi-minh/quan-binh-tan/mua-ban-nha-dat',
      label: 'Quận Bình Tân'
    },
    dist_binh_thanh: {
      url: '/tp-ho-chi-minh/quan-binh-thanh/mua-ban-nha-dat',
      label: 'Quận Bình Thạnh'
    },
    dist_go_vap: {
      url: '/tp-ho-chi-minh/quan-go-vap/mua-ban-nha-dat',
      label: 'Quận Gò Vấp'
    },
    dist_phu_nhuan: {
      url: '/tp-ho-chi-minh/quan-phu-nhuan/mua-ban-nha-dat',
      label: 'Quận Phú Nhuận'
    },
    dist_tan_binh: {
      url: '/tp-ho-chi-minh/quan-tan-binh/mua-ban-nha-dat',
      label: 'Quận Tân Bình'
    },
    dist_tan_phu: {
      url: '/tp-ho-chi-minh/quan-tan-phu/mua-ban-nha-dat',
      label: 'Quận Tân Phú'
    },
    dist_thu_duc: {
      url: '/tp-ho-chi-minh/quan-thu-duc/mua-ban-nha-dat',
      label: 'Quận Thủ Đức'
    },
    dist_binh_chanh: {
      url: '/tp-ho-chi-minh/huyen-binh-chanh/mua-ban-nha-dat',
      label: 'Huyện Bình Chánh'
    },
    dist_cu_chi: {
      url: '/tp-ho-chi-minh/huyen-cu-chi/mua-ban-nha-dat',
      label: 'Huyện Củ Chi'
    },
    dist_hoc_mon: {
      url: '/tp-ho-chi-minh/huyen-hoc-mon/mua-ban-nha-dat',
      label: 'Huyện Hóc Môn'
    },
    dist_nha_be: {
      url: '/tp-ho-chi-minh/huyen-nha-be/mua-ban-nha-dat',
      label: 'Huyện Nhà Bè'
    },
    dist_can_gio: {
      url: '/tp-ho-chi-minh/huyen-can-gio/mua-ban-nha-dat',
      label: 'Huyện Cần Giờ'
    }
  }
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
