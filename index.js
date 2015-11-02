var exec = require('child_process').exec
var fs = require('fs')

var _ = require('lodash')
var async = require('async')
var request = require('request')
var parser = require('xml2json')

var company = process.env.FASTSPRING_COMPANY
var username = process.env.FASTSPRING_API_USERNAME
var password = process.env.FASTSPRING_API_PASSWORD

if (!process.env.FASTSPRING_COMPANY || !process.env.FASTSPRING_USERNAME || !process.env.FASTSPRING_API_USERNAME || !process.env.FASTSPRING_PASSWORD || !process.env.FASTSPRING_API_PASSWORD) {
  console.error('Usage: FASTSPRING_COMPANY=acme FASTSPRING_USERNAME=john@example.com FASTSPRING_PASSWORD=secret FASTSPRING_API_USERNAME=john+api@example.com FASTSPRING_API_PASSWORD=secret2 npm start\n')
  process.exit()
}

console.log('starting phantom (might take a while...)')
exec('phantomjs crawl.js', function (error, stdout, stderr) {
  console.log('stdout: ' + stdout)
  console.log('stderr: ' + stderr)
  if (error !== null) {
    console.log('exec error: ' + error)
    process.exit(1)
  }

  var orderIds = fs.readFileSync('data/order-ids.txt').toString().split('\n')
  var urls = orderIds.map(function (id) {
    return 'https://api.fastspring.com/company/' + company + '/order/' + id
  })
  async.mapSeries(urls, get, handleOrders)
})

function get (url, callback) {
  console.log('loading %s', url)
  var options = {
    auth: {
      user: username,
      pass: password
    }
  }
  request.get(url, options, function (error, response) {
    if (error) {
      return callback(error)
    }

    if (response.statusCode >= 400) {
      console.log(response.statusCode + ': ' + response.statusMessage + ' (' + response.request.method + ' ' + response.request.href + ') – trying again')
      return setTimeout(function () {
        get(url, callback)
      }, 3000)
    }

    callback(null, toJson(response))
  })
}

function toJson (response) {
  var data = JSON.parse(parser.toJson(response.body))
  return data.order || data.subscription
}

function toSubscriptionId (order) {
  return order.orderItems.orderItem.subscriptionReference
}

function handleOrders (error, orders) {
  if (error) {
    return console.error(error)
  }

  fs.writeFileSync('data/orders.json', JSON.stringify(orders, null, 4), 'utf8')

  console.log('%d orders loaded', orders.length)
  // console.log(JSON.stringify(orders, null, 2))

  var subscriptionIds = orders.map(toSubscriptionId)

  var urls = _.uniq(subscriptionIds).map(function (id) {
    return 'https://api.fastspring.com/company/' + company + '/subscription/' + id
  })

  // get subscriptions
  async.mapSeries(urls, get, handleSubscriptions)
}

function handleSubscriptions (error, subscriptions) {
  if (error) {
    return console.error(error)
  }

  fs.writeFileSync('data/subscriptions.json', JSON.stringify(subscriptions, null, 4), 'utf8')
  console.log('%d subscriptions loaded', subscriptions.length)

  require('./check-subscriptions')
}
