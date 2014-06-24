// var REQUEST_ID = 0;

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
    // else
    if (xhr.readyState === 4) {
      window.callPhantom({
        patchId: patchId,
        status: xhr.status,
        success: xhr.status === 200,
        body: JSON.parse(xhr.responseText)
      });
    }
  };
  xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
  xhr.setRequestHeader('Accept', 'application/json,application/json,application/jsonrequest');
  xhr.send(JSON.stringify(data));

  // $.ajax({
  //   type: 'POST',
  //   url: '/gerrit_ui/rpc/ChangeDetailService',
  //   headers: {
  //     'Accept': 'application/json,application/json,application/jsonrequest',
  //     'Content-Type': 'application/json; charset=UTF-8'
  //   },
  //   data: data,
  //   success: function(resp, a, xhr) {
  //     window.callPhantom({
  //       success: true,
  //       patchId: patchId,
  //       status: xhr.status,
  //       body: resp
  //     });
  //   },
  //   error: function(error, a, b) {
  //     window.callPhantom({
  //       patchId: patchId,
  //       failed: true,
  //       status: error.status,
  //       body: error.responseText
  //     });
  //   }
  // });

  return true;
};