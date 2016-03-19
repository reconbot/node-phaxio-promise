'use strict';

const Phaxio = require('../src/phaxio');
const nock = require('nock');
const mockResponses = require('./phaxio-responses');
const Busboy = require('busboy');
const fs = require('fs');

const key = process.env.API_KEY || 'testkey';
const secret = process.env.API_SECRET || 'testsecret';


function makePhaxio(){
  return new Phaxio(key, secret);
}


// Setup network access, disable everything,
// and start a mock to phaxio for use in each test
// at the end of each test ensure mocks were hit and nothing is left over
let mockPhaxio;

before(function(){
  // Causes a timeout on unmocked endpoints should be throwing an error somewhere
  nock.disableNetConnect();
});

after(function(){
  nock.enableNetConnect();
});

beforeEach(function(){
  mockPhaxio = nock('https://api.phaxio.com', {
    'encodedQueryParams':true
  });
});

afterEach(function(){
  mockPhaxio.done();
  nock.cleanAll();
});

describe('Phaxio', function() {

  it('Initialization', function() {
    assert.isOk(new Phaxio());
  });

  describe('communication', function(){
    it('provides auth headers', function(){
      mockPhaxio.post('/v1/faxStatus', body => {
        return body.match(/23250797/) && body.match(key) && body.match(secret);
      }).reply(200, mockResponses.faxStatus);

      return makePhaxio().faxStatus(23250797);
    });

    it('resolves the data object', function(){
      mockPhaxio.post('/v1/faxStatus').reply(200, mockResponses.faxStatus);

      return makePhaxio().faxStatus(23250797).then(data => {
        assert.deepEqual(data, mockResponses.faxStatus.data);
      });
    });

    it('rejects the error objects', function(){
      mockPhaxio.post('/v1/faxStatus').reply(200, mockResponses.faxStatusFailed);

      const message = mockResponses.faxStatusFailed.message;

      return makePhaxio().faxStatus(1).then(
        data => Promise.reject(data),
        err => assert.equal(err.message, message)
      );
    });

    it('rejects http errors', function(){
      mockPhaxio.post('/v1/faxStatus').reply(500);

      return makePhaxio().faxStatus(1).then(
        data => Promise.reject(data),
        err => assert.match(err.message, /Internal Server Error/)
      );
    });
  });

  describe('id based api calls', function(){

    const idBasedAPIs = [
      'faxCancel',
      'faxStatus',
      'fireBatch',
      'closeBatch'
    ];

    idBasedAPIs.forEach((name) => {
      it(`#${name}`, function(){
        const response = mockResponses[name];
        mockPhaxio.post(`/v1/${name}`).reply(200, response);
        return makePhaxio()[name](1).then(data => {
          assert.deepEqual(data, response.data);
        });
      });
    });
  });

  describe('#provisionNumber', function(){
    it('requires an area_code', function(){
      return makePhaxio().provisionNumber({}).then(
        data => Promise.reject(data),
        err => Promise.resolve(err)
      );
    });

    it('requests a new number', function(){
      mockPhaxio.post('/v1/provisionNumber', /516/).reply(200, mockResponses.provisionNumber);
      return makePhaxio().provisionNumber({area_code: '516'});
    });
  });

  describe('#accountStatus', function(){
    it('gets your account status', function(){
      mockPhaxio.post('/v1/accountStatus').reply(200, mockResponses.accountStatus);
      return makePhaxio().accountStatus();
    });
  });

  describe('.processForm', function(){
    it('handles files', function(done){
      let form = Phaxio.processForm({
        filename: `${__dirname}/test.pdf`,
        name: 'tomas'
      });

      var busboy = new Busboy({ headers: form.getHeaders() });
      busboy.on('file', (fieldName, file, fileName) => {
        file.on('data', () => {});
        assert.equal(fieldName, 'filename');
        assert.equal(fileName, 'test.pdf');
      });
      busboy.on('field', (name, value) => {
        assert.equal(name, 'name');
        assert.equal(value, 'tomas');
      });
      busboy.on('finish', done);
      form.pipe(busboy);
    });
  });

  describe('#send', function(){
    it('sends sends a local file', function(){
      mockPhaxio.post('/v1/send').reply(200, mockResponses.send);
      return makePhaxio().send({
        to: '+12125551212',
        filename: `${__dirname}/test.pdf`
      }).then(data => assert.equal(data.faxId, 23261516));
    });

    // TODO
    // it('rejects without a local file', function(){
    //   return makePhaxio().send({
    //     to: '+12125551212',
    //     filename: 'nope.file'
    //   }).then(
    //     data => Promise.reject(data),
    //     err => Promise.resolve(err)
    //   );
    // });

    it('sends sends multiple local files', function(){
      mockPhaxio.post('/v1/send').reply(200, mockResponses.send);
      return makePhaxio().send({
        to: '+12125551212',
        filename: [
          `${__dirname}/test.pdf`,
          `${__dirname}/test.txt`
        ]
      }).then(data => assert.equal(data.faxId, 23261516));
    });

    it('sends a string as a file', function(){
      mockPhaxio.post('/v1/send').reply(200, mockResponses.send);
      return makePhaxio().send({
        to: '+12125551212',
        string_data: 'https://github.com',
        strig_data_type: 'url'
      }).then(data => assert.equal(data.faxId, 23261516));
    });

    it('takes a file stream', function(){
      mockPhaxio.post('/v1/send').reply(200, mockResponses.send);
      return makePhaxio().send({
        to: '+12125551212',
        filename: fs.createReadStream(`${__dirname}/test.pdf`)
      }).then(data => assert.equal(data.faxId, 23261516));
    });
  });

  describe('functions that get files', function(){
    describe('faxFile', function(){
      it('retrieves the files contents', function(){
        nock('https://api.phaxio.com').post('/v1/faxFile')
          .replyWithFile(200, `${__dirname}/test.txt`);
        return makePhaxio().faxFile('23269672').then(body => {
          return assert.equal(body, 'hi this is a file\n');
        });
      });
    });

    describe('getHostedDocument', function(){
      it('retrieves the files contents', function(){
        nock('https://api.phaxio.com').post('/v1/getHostedDocument')
          .replyWithFile(200, `${__dirname}/test.txt`);
        return makePhaxio().getHostedDocument('coolThing').then(body => {
          return assert.equal(body, 'hi this is a file\n');
        });
      });
    });
  });

});
