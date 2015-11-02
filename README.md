# fastspring-tell-me-how-many-subscriptions-i-got

> Fixing Fastspring’s inability to answer the most basic question

## Requirements

1. Install [phantomjs 2.0](http://phantomjs.org/)
2. Two Fastspring user accounts: one with access to reports, and one with Role "Limited API User". [Manage Fastspring Users](https://springboard.fastspring.com/membership/all/users.xml)


```
git clone git@github.com:gr2m/fastspring-tell-me-how-many-subscriptions-i-got.git
cd fastspring-tell-me-how-many-subscriptions-i-got
npm install
FASTSPRING_COMPANY=acme FASTSPRING_USERNAME=john@example.com FASTSPRING_PASSWORD=secret FASTSPRING_API_USERNAME=john+api@example.com FASTSPRING_API_PASSWORD=secret2 npm start
```

## How it works

1. Signs in to your fastspring.com account and scrapes all order IDs, writes these into `data/order-ids.txt`
2. Get all orders, one by one, and write them into `data/orders.json`
3. Extract all subscription IDs, load them one by one, write them into `data/subscripions.json`
4. Show some statistics

To show statistics from the last time you loaded subscriptions, run `node check-subscriptions.js`.

Pull requests welcome 💝

## License

MIT
