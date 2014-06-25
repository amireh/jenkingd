var RSVP = require('rsvp');
var K = require('../constants');

module.exports = function(link, page) {
  return new RSVP.Promise(function(resolve, reject) {
    console.log('Jenkins: retriggering', link);
    page.open(link + '/gerrit-trigger-retrigger-this', function(status) {
      if (status === 'success') {
        resolve();
      }
      else {
        reject({
          status: 500,
          code: K.ERROR_UNKNOWN,
          message: 'retrigger failed'
        });
      }
    });
  });
};