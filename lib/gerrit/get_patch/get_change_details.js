/**
 * Query patch details using an internal gerrit JSON-P routine. Requires a page
 * context with a valid XSRF token.
 *
 * @param  {String} patchId
 * @param  {String} xsrfKey
 *
 * === On success
 *
 * Phantom will be called with the following object:
 *
 *   {
 *     "success": true,
 *     "patchId": "patch_id_you_requested",
 *     "details": {
 *     }
 *   }
 *
 * For an example of the details, see fixture/change_detail_response.json. You
 * will get the entire payload that is inside the "result" key to format/pick
 * what you need from it.
 *
 * If, for whatever reason, the payload could not be parsed as JSON, the error
 * subroutine will be engaged instead with a status of 500 and responseText of
 * "unable to parse payload".
 *
 * === On error
 *
 * Phantom will be called with the following object:
 *
 *   {
 *     "success": false,
 *     "patchId": "patch_id_you_requested",
 *     "status": xhrStatus,
 *     "responseText": "whatever the xhr.responseText was"
 *   }
 *
 * @return {undefined}
 */
module.exports = function getChangeDetails(patchId, xsrfKey) {
  var xhr;
  var SERVICE_URL = '/changes/' + patchId + '/detail';
  var data = { xsrfKey: xsrfKey };

  xhr = new XMLHttpRequest();
  xhr.open('GET', SERVICE_URL, true);
  xhr.onreadystatechange = function() {
    var payload;
    var error;
    var GARBAGE = /^\)\]\}\'\[?/;

    var stripJsonJunk = function(jsonStr) {
      return jsonStr.replace(GARBAGE, "");
    };

    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        try {
          payload = JSON.parse(stripJsonJunk(xhr.responseText));
        }
        catch (e) {
          payload = undefined;
          error = e;
        }
        finally {
          if (payload) {
            window.callPhantom({
              success: true,
              patchId: patchId,
              details: payload
            });
          }
          else {
            window.callPhantom({
              success: false,
              status: 500,
              responseText: 'unable to parse payload:' + error
            });
          }
        }
      }
      else {
        window.callPhantom({
          success: false,
          status: xhr.status,
          responseText: xhr.responseText
        });
      }
    }
  };

  xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
  xhr.setRequestHeader('Accept', 'application/json');
  xhr.send(JSON.stringify(data));
};