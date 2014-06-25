var getPatches = require('../link_scraper/get_patches');
var RSVP = require('rsvp');

module.exports = function getActivePatches(page, xsrfKey) {
  var service = RSVP.defer();
  var patchIds = [];

  page.onCallback = function parsePatches(resp) {
    console.log('XHR status:', resp.status, resp.success);

    if (resp.success) {
      output = resp.patches;
      patchIds = output.map(function(patch) {
        return patch._number;
      });

      service.resolve(patchIds);
    }
    else {
      service.reject({
        status: resp.status,
        code: resp.message
      });
    }
  };

  page.evaluate(getPatches, xsrfKey);

  return service.promise;
};