#!/usr/bin/env phantomjs

var page = require('webpage').create();
var servicePage = require('webpage').create();
var extractLinks = require('./extract_links');
var sniffXSRFToken = require('./link_scraper/sniff_xsrf_token');
var getChangeDetails = require('./link_scraper/get_change_details');

// todo: argify
var TIMEOUT = 20000;
var PATCHES = [ 36559, 36070 ];

var output = [];
var requestCount = PATCHES.length;
var errorCount = 0;

page.settings.loadImages = false;
page.customHeaders = {
  'Authorization': 'Basic YWhtYWQ6ZW5zdHJ1Y3R1cmVUdW9uI2xhODk='
};

// Sniff the XSRF token:
page.onResourceReceived = function(response) {
  var xsrfKey = sniffXSRFToken(response);

  if (xsrfKey) {
    console.log('XSRF token:', xsrfKey);

    page.onResourceReceived = null;

    dispatch(xsrfKey);
  }
};

// Extract the links from the ChangeDetailService output:
page.onCallback = function(resp) {
  console.log('XHR status:', resp.status, resp.success);

  if (resp.success) {
    output.push({
      patch: resp.patchId,
      links: extractLinks(resp.body)
    });
  }
  else {
    console.log('XHR failure:', JSON.stringify(resp));
    errorCount += 1;
  }

  if (--requestCount === 0) {
    console.log(JSON.stringify(output, null, 2));
    phantom.exit(errorCount === 0 ? 0 : 1);
  }
};

function dispatch(xsrfKey) {
  PATCHES.forEach(function(patchId) {
    console.log('Requesting details for patch:', patchId);
    page.evaluate(getChangeDetails, patchId, xsrfKey);
  });
}

page.open('https://gerrit.instructure.com/', function(status) {
  console.log('Page opened successfully?', status === 'success');

  setTimeout(function() {
    console.log('Timed out.');
    phantom.exit(1);
  }, TIMEOUT);
});
