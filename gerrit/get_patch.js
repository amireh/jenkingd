var getChangeDetails = require('../link_scraper/get_change_details');
var extractLinks = require('../extract_links');
var RSVP = require('rsvp');
var services = {};

module.exports = function getPatch(patchId, page, xsrfKey) {
  var service = services[patchId] = RSVP.defer();

  page.onCallback = function parsePatch(resp) {
    var service = services[resp.patchId];

    if (resp.success) {
      console.log('Patch retrieval success:', resp.patchId);

      service.resolve({
        id: ''+resp.patchId,
        subject: resp.details.change.subject,
        links: extractLinks(resp.details),
        submitRecords: resp.details.submitRecords,
        mergeable: resp.details.change.mergeable,
        canSubmit: resp.details.canSubmit
      });
    }
    else {
      console.log('Patch retrieval failed:', resp.responseText);
      service.reject({
        status: resp.status,
        message: resp.responseText
      });
    }
  };

  page.evaluate(getChangeDetails, patchId, xsrfKey);

  return service.promise;
};