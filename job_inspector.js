#!/usr/bin/env node

var parseLog = require('./parse_log');

module.exports = function(link, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', link + '/api/json', true);
  xhr.onreadystatechange = function() {
    var logXhr;

    if (xhr.readyState === 4) {
      var job = JSON.parse(xhr.responseText);
      var logHtml;
      var log = '';

      logXhr = new XMLHttpRequest();
      logXhr.open('GET', link + '/console', false);
      logHtml = logXhr.send();

      log = parseLog(logHtml);

      callback({
        success: job.result !== 'FAILURE',
        log: log
      });
    }
  };

  xhr.setRequestHeader('Accept', 'application/json');
  xhr.send();
};