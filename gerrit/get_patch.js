var getChangeDetails = require('../link_scraper/get_change_details');
var extractLinks = require('../extract_links');
var RSVP = require('rsvp');

module.exports = function getActivePatches(patchId, page, xsrfKey) {
  var service = RSVP.defer();

  page.onCallback = function parsePatch(resp) {
    if (resp.success) {
      service.resolve({
        id: resp.patchId,
        links: extractLinks(resp.details),
        submitRecords: resp.details.submitRecords,
        mergeable: resp.details.change.mergeable,
        canSubmit: resp.details.canSubmit
      });
    }
    else {
      service.reject({
        status: resp.status,
        message: resp.responseText
      });
    }
  };

  page.evaluate(getChangeDetails, patchId, xsrfKey);

  return service.promise;
};