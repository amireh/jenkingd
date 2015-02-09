var RSVP = require('rsvp');
var K = require('../constants');

module.exports = function(link, page) {
  return new RSVP.Promise(function(resolve, reject) {
    var targetUrl = link + '/gerrit-trigger-retrigger-this';
    page.onResourceReceived = function(resource) {
      if (resource.url === targetUrl) {
        if (resource.status === 302) {
          resolve();
        }
        else {
          reject({
          status: 500,
          code: K.ERROR_UNKNOWN,
          message: 'retrigger failed'
          });
        }
      }
    }
    page.open(targetUrl);
  });
};