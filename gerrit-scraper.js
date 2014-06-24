#!/usr/bin/env phantomjs

var page = require('webpage').create();
var xsrfKey;
var servicePage = require('webpage').create();
var extractLinks = require('./extract_links');
var sniffXSRFToken = require('./link_scraper/sniff_xsrf_token');
var getChangeDetails = require('./link_scraper/get_change_details');

// todo: argify
var PATCH_ID = 36559;
var REQUEST_ID = 0;
var TIMEOUT = 20000;

page.customHeaders = {
  'Authorization': 'Basic YWhtYWQ6ZW5zdHJ1Y3R1cmVUdW9uI2xhODk='
};

// page.settings.userName = 'ahmad';
// page.settings.password = 'enstructureTuon#la89';
// page.settings.webSecurityEnabled = false;
page.settings.loadImages = false;

// page.onResourceRequested = function(requestData, networkRequest) {
//   console.log('Request (#' + requestData.id + '): ' + JSON.stringify(requestData));
// };

page.onCallback = function(resp) {
  if (resp.success) {
    var links = extractLinks(resp.body);
    console.log('Jenkins links:', JSON.stringify(links));
    phantom.exit(0);

  } else {
    console.log('XHR failure:', JSON.stringify(resp));
    phantom.exit(1);
  }
};

// Sniff the XSRF token:
page.onResourceReceived = function(response) {
  var token = sniffXSRFToken(response);

  if (token) {
    console.log('XSRF token:', token);

    xsrfKey = token;
    page.onResourceReceived = null;
  }
};

page.open('https://gerrit.instructure.com/#/c/36559/', function(status) {
  var requestDispatched = false;
  var ready;

  console.log('Page opened successfully?', status === 'success');

  setTimeout(function() {
    console.log('Timed out.');
    phantom.exit(1);
  }, TIMEOUT);

  setInterval(function() {
    ready = page.evaluate(function() {
      try { return !!$; }
      catch(e) {
        return false;
      }
    });
  }, 250);

  setInterval(function() {
    if (!xsrfKey || !ready || requestDispatched) {
      return;
    }

    console.log('Getting patchset information.');

    requestDispatched = true;

    page.evaluate(getChangeDetails, PATCH_ID, xsrfKey);
  }, 1000);
  // page.close();
});
