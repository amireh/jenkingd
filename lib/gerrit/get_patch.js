var getChangeDetails = require('./get_patch/get_change_details');
var extractLinks = require('./get_patch/extract_links');
var RSVP = require('rsvp');
var services = {};

module.exports = function getPatch(patchId, page, xsrfKey) {
  var service = services[patchId] = RSVP.defer();

  page.onCallback = function parsePatch(resp) {
    var service = services[resp.patchId];

    if (resp.success) {
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
      service.reject({
        status: resp.status,
        message: resp.responseText
      });
    }
  };

  page.evaluate(getChangeDetails, patchId, xsrfKey);

  return service.promise;
};