var RSVP = require('rsvp');

function sneakilyGetPatches(xsrfKey) {
  var SERVICE_URL = '/changes/?q=owner:self+status:open';
  var xhr;
  var GARBAGE = ")]}'[";

  xhr = new XMLHttpRequest();
  xhr.open('GET', SERVICE_URL, true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4 && xhr.status === 200) {
      var patches;
      var resp = xhr.responseText;

      try {
        patches = JSON.parse(resp.substr(GARBAGE.length, resp.length - 1));
      } catch(e) {
        patches = {
          exception: e,
          string: resp.substr(GARBAGE.length, resp.length - 1)
        };
      }

      window.callPhantom({
        status: xhr.status,
        success: xhr.status === 200,
        patches: patches
      });
    }
  };

  xhr.setRequestHeader('Accept', 'application/json');
  xhr.setRequestHeader('X-Gerrit-Auth', xsrfKey);
  xhr.send();

  return true;
};

module.exports = function getPatches(page, xsrfKey) {
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

  page.evaluate(sneakilyGetPatches, xsrfKey);

  return service.promise;
};