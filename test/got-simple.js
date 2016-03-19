'use strict';

// This file shows how got and nock don't play well together with regards to
// disableNetConnect()
// https://github.com/sindresorhus/got/issues/187


let nock = require('nock');
let got = require('got');
let http = require('http');

nock.disableNetConnect();

// http get
let req = http.get('http://example.com/war');
req.on('error', (err) =>{
  console.log(err.message);
});
// Nock: Not allow net connect for "example.com:80/war"

// got get
got('http://example.com/war').then(
  () => console.log('success'),
  err => console.error(err)
);
// Promise never resolves
