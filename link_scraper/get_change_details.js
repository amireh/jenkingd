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
  var SERVICE_URL = '/gerrit_ui/rpc/ChangeDetailService';
  var xhr;
  var data = {
    jsonrpc: '2.0',
    method: 'changeDetail',
    xsrfKey: xsrfKey,
    params: [{
      id: patchId
    }]
  };

  xhr = new XMLHttpRequest();
  xhr.open('POST', SERVICE_URL, true);
  xhr.onreadystatechange = function() {
    var payload;

    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        try {
          payload = JSON.parse(xhr.responseText);
        }
        catch (e) {
          payload = undefined;
        }
        finally {
          if (payload) {
            window.callPhantom({
              success: true,
              patchId: patchId,
              details: payload.result
            });
          }
          else {
            window.callPhantom({
              success: false,
              status: 500,
              responseText: 'unable to parse payload'
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
  xhr.setRequestHeader('Accept', 'application/json,application/json,application/jsonrequest');
  xhr.send(JSON.stringify(data));
};