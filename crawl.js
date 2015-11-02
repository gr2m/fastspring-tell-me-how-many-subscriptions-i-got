/* global phantom */

var system = require('system')

var username = system.env.FASTSPRING_USERNAME
var password = system.env.FASTSPRING_PASSWORD

if (!username || !password) {
  console.error('Usage: FASTSPRING_USERNAME=john@example.com FASTSPRING_PASSWORD=secret phantomjs crawl.js\n')
  phantom.exit(1)
}

var fs = require('fs')
var page = require('webpage').create()
var loginUrl = 'https://springboard.fastspring.com/login.xml'
var ordersUrl = 'https://springboard.fastspring.com/report/dashboard.xml?mRef=ReportView%3A74ce6ff4-0d96-4464-83fc-c7746285512b&date=2014-10-2-2015-11-1'

phantom.clearCookies()

page.viewportSize = {
  width: 1280,
  height: 1024
}
page.settings.userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.80 Safari/537.36'

console.log('Loading ' + loginUrl + ' ...')
page.open(loginUrl, function (status) {
  console.log('Login loaded.')

  // set username
  page.evaluate(function (username) {
    document.querySelector('.elementUsernameInput').value = username
  }, username)

  // set password
  page.evaluate(function (password) {
    document.querySelector('.elementPasswordInput').value = password
  }, password)

  // submit form
  page.evaluate(function (password) {
    document.querySelector('.elementLoginActionButton').click()
  })

  waitFor(function () {
    return page.evaluate(function () {
      return location.pathname === '/site/store/home.xml'
    })
  }, function () {
    console.log('signed in.')

    page.open(ordersUrl, function (status) {
      console.log('Orders page opened.')

      waitFor(function () {
        return page.evaluate(function () {
          return document.querySelectorAll('table.dataTableLinked tbody tr').length
        })
      }, function () {
        console.log('Orders loaded.')
        var orders = page.evaluate(function () {
          var cells = document.querySelectorAll('table.dataTableLinked tbody tr td:last-child')
          var ids = [].map.call(cells, function (el) {
            return el.textContent
          })
          return ids.join(',')
        }).split(',')

        var path = 'data/order-ids.txt'
        fs.write(path, orders.join('\n'), 'w')
        console.log(path + ' written')
        phantom.exit()
      })
    })
  })
})

function waitFor (testFx, onReady, timeOutMillis) {
  var maxtimeOutMillis = timeOutMillis ? timeOutMillis : 10000
  var start = new Date().getTime()
  var condition = false
  var interval = setInterval(function () {
    page.render('fastspring-debug.png')
    if ((new Date().getTime() - start < maxtimeOutMillis) && !condition) {
      // If not time-out yet and condition not yet fulfilled
      condition = testFx()
    } else {
      if (!condition) {
        // If condition still not fulfilled (timeout but condition is 'false')
        console.error('"waitFor()" timeout')
        phantom.exit(1)
      } else {
        // Condition fulfilled (timeout and/or condition is 'true')
        onReady()
        clearInterval(interval)
      }
    }
  }, 250)
}
