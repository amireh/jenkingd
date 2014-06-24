#!/usr/bin/env phantomjs

var page = require('webpage').create();
var xsrfKey;
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

page.customHeaders = {
  'Authorization': 'Basic YWhtYWQ6ZW5zdHJ1Y3R1cmVUdW9uI2xhODk='
};

// page.settings.userName = 'ahmad';
// page.settings.password = 'enstructureTuon#la89';
// page.settings.webSecurityEnabled = false;
page.settings.loadImages = false;

// page.onResourceRequested = function(requestData, networkRequest) {
//   console.log('Request to:', requestData.url);

//   if (requestData.url.match(/capabilities/)) {
//     console.log('Request (#' + requestData.id + '): ' + JSON.stringify(requestData));
//     console.log('Request headers:', JSON.stringify(requestData.headers));
//   }
// };

page.onCallback = function(resp) {
  if (resp.success) {
    output.push({
      patch: resp.patchId,
      links: extractLinks(resp.body)
    });
    // phantom.exit(0);
  } else {
    console.log('XHR failure:', JSON.stringify(resp));
    // phantom.exit(1);
    errorCount += 1;
  }

  if (--requestCount === 0) {
    console.log(JSON.stringify(output, null, 2));
    phantom.exit(errorCount === 0 ? 0 : 1);
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

page.open('https://gerrit.instructure.com/', function(status) {
  var ready;
  var dispatcher;

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

  dispatcher = setInterval(function() {
    if (!xsrfKey || !ready) {
      return;
    }

    console.log('Getting patchset information.');

    PATCHES.forEach(function(patchId) {
      page.evaluate(getChangeDetails, patchId, xsrfKey);
    });

    clearInterval(dispatcher);
    dispatcher = null;
  }, 1000);
  // page.close();
});
