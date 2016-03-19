// 'use strict';

// let nock = require('nock');
// let got = require('got');
// let http = require('http');

// describe('nock error handling', function() {

//   beforeEach(function(){
//     nock.disableNetConnect();
//   });

//   afterEach(function(){
//     nock.cleanAll();
//     nock.enableNetConnect();
//   });

//   it('mocks with http.get', function(done) {
//     nock('http://example.com').get('/love').reply(200);
//     var req = http.request('http://example.com/love', res => {
//       assert.equal(res.statusCode , 200);
//       done();
//     });
//     req.end();
//   });

//   it('throws with http.get', function(done){
//     let req = http.get('http://example.com/war');
//     req.on('error', (err) =>{
//       assert.match(err.message, /Not allow net connect/);
//       done();
//     });
//   });

//   it('mocks with got', function() {
//     nock('http://example.com').get('/love').reply(200);
//     return got('http://example.com/love');
//   });

//   it('rejects with got', function(){
//     return got('http://example.com/war').then(
//       resp => Promise.reject(resp),
//       err => Promise.resolve(err)
//     );
//   });

//   it('got rejects with other client errors', function(){
//     nock.enableNetConnect();
//     return got('http://baddomain.notld.noresolve/war').then(
//       resp => Promise.reject(resp),
//       err => Promise.resolve(err)
//     );
//   });

// });
