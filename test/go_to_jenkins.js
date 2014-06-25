#!/usr/bin/env phantomjs

var page = require('webpage').create();
var url = 'http://jenkins.instructure.com/job/canvas-plugins-core-rails3/2705';

page.open(url, function(status) {
  console.log('Opened:', status);
  page.open(url + '/gerrit-trigger-retrigger-this', function(status) {
    console.log('Retrigger:', status);
    phantom.exit();
  });
});