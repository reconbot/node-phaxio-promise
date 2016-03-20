'use strict';

const fs = require('fs');
const path = require('path');
const got = require('got');
const FormData = require('form-data');
const ReadableStream = require('stream').Readable;

function processPhaxioResponse(response) {
  const body = response.body;
  if (body.success) {
    return body.data;
  }
  return Promise.reject(new Error(body.message));
}

function processForm(data){
  const form = new FormData();
  Object.keys(data).forEach(field => {
    if (field === 'filename') { return; }
    form.append(field, data[field]);
  });

  if (!data.filename) {
    return form;
  }

  let files;
  if (Array.isArray(data.filename)) {
    files = data.filename;
  } else {
    files = [data.filename];
  }

  files.forEach(file => {
    let filename, stream;
    if (typeof file === 'string') {
      filename = path.basename(file);
      stream = fs.createReadStream(file);
    } else if (file instanceof ReadableStream) {
      if (file.path) {
        filename = path.basename(file.path);
      } else {
        filename = 'Unknown-File-Name';
      }
      stream = file;
    } else {
      throw new Error(`Don't know how to read: ${file}`);
    }

    form.append(
      'filename',
      stream,
      { filename }
    );
  });

  return form;
}

function validateFields(data, fields){
  for(let i=0; i < fields.length; i++){
    let field = fields[i];
    if(!data[field]){
      return Promise.reject(new Error(`Missing field ${field}`));
    }
  }
  return Promise.resolve(data);
}

function Phaxio(apiKey, apiSecret) {
  this.apiKey = apiKey;
  this.apiSecret = apiSecret;
  this.host = 'https://api.phaxio.com';
  this.endpoint = '/v1';
  this.retries = 0;
}

Phaxio.processForm = processForm;

module.exports = Phaxio;

Phaxio.prototype.post = function(resource, overRides){
  return form => {
    form.append('api_key', this.apiKey);
    form.append('api_secret', this.apiSecret);
    const opt = {
      body: form,
      json: true,
      headers: form.getHeaders(),
      retries: this.retries
    };
    Object.assign(opt, overRides);
    const url = `${this.host}${this.endpoint}/${resource}`;
    return got.post(url, opt);
  };
};

const idBasedAPI = [
  'faxCancel',
  'faxStatus',
  'fireBatch',
  'closeBatch'
];

idBasedAPI.forEach(name => {
  Phaxio.prototype[name] = function(id) {
    return validateFields({id}, ['id'])
      .then(processForm)
      .then(this.post(name))
      .then(processPhaxioResponse);
  };
});

var apis = [
  {name: 'provisionNumber', required: ['area_code']},
  {name: 'releaseNumber', required: ['number']},
  {name: 'numberList', required: []},
  {name: 'areaCodes', required: []},
  {name: 'accountStatus', required: []},
  {name: 'createPhaxCode', required: []}
];

apis.forEach(info => {
  const name = info.name;
  const required = info.required;
  Phaxio.prototype[name] = function(data){
    data = data || {};
    return validateFields(data, required)
      .then(processForm)
      .then(this.post(name))
      .then(processPhaxioResponse);
  };
});

Phaxio.prototype.send = function(data) {
  data = data || {};
  if (!(data.filenames || data.filename || data.string_data)) {
    return Promise.reject(new Error('You must include a filenames, filename or string_data field.'));
  }

  return validateFields(data, ['to'])
    .then(processForm)
    .then(this.post('send'))
    .then(processPhaxioResponse);
};

Phaxio.prototype.testReceive = function(data) {
  return validateFields(data, ['filename'])
    .then(processForm)
    .then(this.post('testReceive'))
    .then(processPhaxioResponse);
};

Phaxio.prototype.attachPhaxCodeToPdf = function(data) {
  return validateFields(data, ['x', 'y', 'filename'])
    .then(processForm)
    .then(this.post('attachPhaxCodeToPdf', { json: false }))
    .then(resp => { return resp.body; });
};

Phaxio.prototype.faxFile = function(opt) {
  return validateFields(opt, ['id'])
    .then(processForm)
    .then(this.post('faxFile', { json: false }))
    .then(resp => {
      return resp.body;
    });
};

Phaxio.prototype.getHostedDocument = function(name) {
  return validateFields({name}, ['name'])
    .then(processForm)
    .then(this.post('getHostedDocument', { json: false }))
    .then(resp => { return resp.body; });
};

