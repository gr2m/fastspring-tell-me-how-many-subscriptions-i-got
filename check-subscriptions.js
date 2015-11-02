var fs = require('fs')

var _ = require('lodash')

var subscriptions = JSON.parse(fs.readFileSync('data/subscriptions.json').toString())
var activeSubscriptions = _.where(subscriptions, {status: 'active'})

console.log('# Subscriptions')
console.log('%d total', subscriptions.length)
console.log('%d active', activeSubscriptions.length)
console.log('%d inactive', subscriptions.length - activeSubscriptions.length)

var productNames = _(subscriptions).pluck('productName').uniq().value()

console.log('')
console.log('# Active Subscriptions')
productNames.forEach(function (name) {
  console.log('%d %s', _.where(activeSubscriptions, {productName: name}).length, name)
})
console.log('')
