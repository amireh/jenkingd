var RSVP = require('rsvp');
var extractLog = require('./get_job_log/extract_log');
var stripLog = require('./get_job_log/strip_log');

module.exports = function(link) {
  return new RSVP.Promise(function(resolve, reject) {
    var xhr;

    xhr = new XMLHttpRequest();
    xhr.open('GET', link + '/console', true);
    xhr.onreadystatechange = function() {
      var log;

      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          log = stripLog(extractLog(xhr.responseText));

          resolve({
            log: log
          });
        }
        else {
          reject({
            status: xhr.status,
            message: xhr.responseText
          });
        }
      }
    };

    xhr.send();
  });
};