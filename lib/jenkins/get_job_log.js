var RSVP = require('rsvp');
var extractLog = require('./get_job_log/extract_log');
var stripLog = require('./get_job_log/strip_log');

var mkXHR = function(link, resolve, reject, stripLog, extractLog) {
  var xhr;

  xhr = new XMLHttpRequest();
  xhr.open('GET', link + '/console', false);
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        window.callPhantom({
          success: true,
          plainText: xhr.responseText
        });
      }
      else {
        window.callPhantom({
          success: false,
          status: xhr.status,
          plainText: xhr.responseText
        });

      }
    }
  };

  xhr.send();
};

module.exports = function(link, page) {
  return new RSVP.Promise(function(resolve, reject) {
    page.onCallback = function parsePatch(resp) {
      if (resp.success) {
        resolve({
          log: stripLog(extractLog(resp.plainText))
        });
      }
      else {
        reject({
          status: resp.status,
          message: resp.plainText
        });
      }
    };

    page.evaluate(mkXHR, link);
  });
};