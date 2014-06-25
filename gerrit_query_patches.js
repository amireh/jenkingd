#!/usr/bin/env phantomjs

var page = require('webpage').create();
var sniffXSRFToken = require('./link_scraper/sniff_xsrf_token');
var getPatches = require('./link_scraper/get_patches');

// todo: argify
var TIMEOUT = 20000;
var output = [];

page.settings.loadImages = false;
page.customHeaders = {
  'Authorization': 'Basic YWhtYWQ6ZW5zdHJ1Y3R1cmVUdW9uI2xhODk='
};

// Sniff the XSRF token:
page.onResourceReceived = function(response) {
  var xsrfKey = sniffXSRFToken(response);

  console.log('Resource:', response.status, response.url);

  if (xsrfKey) {
    console.log('XSRF token:', xsrfKey);

    page.onResourceReceived = null;

    dispatch(xsrfKey);
  }
};

page.onCallback = function(resp) {
  console.log('XHR status:', resp.status, resp.success);

  if (resp.success) {
    output = resp.patches;
    // console.log(JSON.stringify(output, null, 2));
    console.log(output.map(function(patch) {
      return patch._number;
    }));
    phantom.exit(0);
  }
  else {
    console.log('XHR failure:', JSON.stringify(resp));
    phantom.exit(1);
  }

};

function dispatch(xsrfKey) {
  console.log('Requesting patch list.');
  page.evaluate(getPatches, xsrfKey);
}

page.open('https://gerrit.instructure.com/', function(status) {
  console.log('Page opened successfully?', status === 'success');

  setTimeout(function() {
    console.log('Timed out.');
    phantom.exit(1);
  }, TIMEOUT);
});
