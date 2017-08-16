
function launchChrome (cb) {
  const chromeLauncher = require('chrome-launcher')

  chromeLauncher.launch({
    chromeFlags: ['--headless', '--disable-gpu']
  }).then(chrome => {
    console.log(`Chrome debugging port running on ${chrome.port}`)
    cb(null, chrome)
  }).catch(err => {
    console.error(`Error launching chrome ${err}`)
    cb(err)
  })
}

function getPageContents (url, chromeInstance) {
  console.log('working on ', url)
  const CDP = require('chrome-remote-interface')
  return new Promise((resolve, reject) => {
    CDP({port: chromeInstance.port}, client => {
      const {Page, Runtime} = client

      Page.loadEventFired(() => {
        setTimeout(() => {
          Runtime.evaluate({expression: 'document.body.outerHTML'}).then((result) => {
            resolve(result.result.value)
            client.close()
            chromeInstance.kill()
          })
        }, 3000)
      })

      // Enable events on domains we are interested in
      Page.enable().then(() => {
        return Page.navigate({url})
      })
    }).on('error', err => {
      console.error('getPageContents: cannot connect to browser', err)
      chromeInstance.kill()
      reject(err)
    })
  })
}

module.exports = {
  launchChrome,
  getPageContents
}
