# phaxio-promise

[![npm version](https://badge.fury.io/js/phaxio-promise.svg)](https://badge.fury.io/js/phaxio-promise) [![Build Status](https://travis-ci.org/reconbot/node-phaxio-promise.svg?branch=master)](https://travis-ci.org/reconbot/node-phaxio-promise) [![Greenkeeper badge](https://badges.greenkeeper.io/reconbot/node-phaxio-promise.svg)](https://greenkeeper.io/) [![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg?style=flat-square)](https://github.com/semantic-release/semantic-release)


Send faxes with [Phaxio](http://www.phaxio.com). It's completely asynchronous and uses Promises.

This was based off of the sweet [node-phaxio](https://github.com/chadsmith/node-phaxio) by Chad Smith. It's got a callback interface and works with node v0.8.x.

## Requires
 - A Phaxio account
 - nodejs >= 4.x

## Installation

`npm install --save phaxio-promise`

## Usage overview

All functions are based off of the API verbs and all options are from the field names found in the [official api docs](https://www.phaxio.com/docs/).


```javascript
const Phaxio = require('phaxio-promise');
const phaxio = new Phaxio('apiKey', 'apiSecret');

phaxio.send({
  to: '13165555555',
  string_data: 'Faxing from Node.js',
  string_data_type: 'text'
}).then(info => phaxio.faxStatus(info.faxId));

```
Resolved data
```javascript

{
  id: '111111',
  num_pages: '0',
  cost: 0,
  direction: 'sent',
  status: 'queued',
  is_test: 'true',
  requested_at: 1344829113,
  recipients: [ { number: '13165555555', status: 'queued' } ]
}


```

## Constructor

### new Phaxio(key, secret);

Returns a phaxio client object.

## Methods

### `send(options)`
[Phaxio Doc - Send](https://www.phaxio.com/docs/api/v1/send/sendFax)

```javascript
phaxio.send({
  // always required can be an array of a single string
  to: ['xxxxxxxx', 'xxxxxxxxx'],

  // one of these forms is required
  filename: ['coverletter.doc', 'resume.pdf']
  filename: 'resume.pdf',
  string_data = 'String of data for phaxio to parse'

  //optional
  string_data_type: 'text',
  batch: false
});

// resolves with
{
  "faxId":1234
}

// Examples

phaxio.send({
  to: '13165555555',
  string_data: 'http://www.google.com/',
  string_data_type: 'url'
});

phaxio.send({
  to: ['13165555555', '19135555555'],
  filename: 'my-cat.jpg',
  batch: true
}).then(console.log);

```

### `faxCancel(faxId)`

Cancels the fax `faxId`
```javascript
phaxio.faxCancel('123456');
// resolves with no data
```

### `faxStatus(faxId)`

Returns the status of `faxId`
```javascript
phaxio.faxStatus('123456');

// resolves with
{
  'id':123456,
  'num_pages':1,
  'cost':7,
  'direction':'sent',
  'status':'success',
  'is_test':true,
  'requested_at':1458419092,
  'completed_at':1458419095,
  'recipients':[
    {
      'number':'+19175551212',
      'status':'success',
      'bitrate':'14400',
      'resolution':'7700',
      'completed_at':1458419095
    }
  ]
}
```

### `fireBatch(batchId)`

Fires the batch `batchId`
```javascript
phaxio.fireBatch(batchId);
```
### `closeBatch(batchId)`

Closes the batch `batchId`
```javascript
phaxio.closeBatch('123456');
```
### `provisionNumber(options);`

Provisions a number in area code `area_code`
```javascript
phaxio.provisionNumber({
  area_code: '847',
  callback_url: 'http://localhost/'
});

// resolves to
{
  'number': '8475551234',
  'city': 'Northbrook',
  'state': 'Illinois',
  'cost': 200,
  'last_billed_at': '2013-11-12 11:39:05',
  'provisioned_at': '2013-11-12 11:39:05'
}
```
### `releaseNumber(options)`

Releases the number `number`
```javascript
phaxio.releaseNumber({
  number: '8475551234'
});
```
### `numberList(options)`

Returns user phone numbers matching optional params `area_code` or `number`
```javascript
phaxio.numberList({
  number: '12128675309'
});

phaxio.numberList({
  area_code: '847'
});
```
### `accountStatus()`

Returns the account status
```javascript
phaxio.accountStatus();

// resolves to
{
  'faxes_sent_this_month':0,
  'faxes_sent_today':0,
  'balance':'93'
}
```
### `testReceive(options)`

Simulates receiving a fax containing the PhaxCode in `filename` with optional params `from_number` and `to_number`
```javascript
phaxio.testReceive({
  filename: 'PhaxCode.pdf'
});

phaxio.testReceive({
  from_number: '3165555555',
  to_number: '9135555555',
  filename: 'PhaxCode.pdf'
});

// Resolves with no data
```

### `attachPhaxCodeToPdf(options)`

Returns a PDF of `filenames` with a PhaxCode at the `x`,`y` location specified with optional params `metadata` and `page_number`
```javascript
phaxio.attachPhaxCodeToPdf({
  filename: 'resume.doc',
  x:0,
  y:5
});

phaxio.attachPhaxCodeToPdf({
  filename:'kittens.pdf',
  x:5,
  y:25,
  metadata: 'Fax with kittens',
  page_number: 5
}).then((fileData) => {
  fs.writeFile('./kittens-with-PhaxCode.pdf'), fileData);
});
```
### `createPhaxCode(options)`

Creates a new PhaxCode with optional `metadata` param and returns the URL. The `redirect` param currently doesn't work, don't use it.
```javascript
phaxio.createPhaxCode();

phaxio.createPhaxCode({
  metadata: 'Awesome'
});

// resolves to
"https://url-of-file/"
```

### `getHostedDocument(options)`

Returns the hosted document `name` with a basic PhaxCode or custom PhaxCode if `metadata` is set
```javascript
phaxio.getHostedDocument({
  name:'order-form',
  metadata: 'Referred by Chad Smith'
}).then((fileData) => {
  fs.writeFile('order-form.pdf', fileData);
});
```

### `faxFile(options)`

Returns the thumbnail or PDF of fax requested, optional `type` specifies `p` for pdf (default), `s` for small or `l` large thumbnails.
```javascript
phaxio.faxFile({
  id:'123456'
}).then((fileData) => {
  fs.writeFile('fax-123456.pdf', fileData);
});

phaxio.faxFile({
  id:'123456',
  type:'l'
}).then((fileData) => {
  fs.writeFile('fax-123456.pdf', fileData);
});
```

See the [issue tracker](reconbot/node-phaxio-promise/issues) for more.

## Authors

[Francis Gulotta](http://twitter.com/reconbot) ([roborooter.com](http://www.roborooter.com))

## License

This project is [UNLICENSED](http://unlicense.org/) and not endorsed by or affiliated with [Phaxio](http://www.phaxio.com).
