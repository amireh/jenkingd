// var REQUEST_ID = 0;

module.exports = function getChangeDetails(patchId, xsrfKey) {
  var data = JSON.stringify({
    jsonrpc: '2.0',
    method: 'changeDetail',
    params: [{
      id: patchId
    }],
    // id: ++REQUEST_ID,
    xsrfKey: xsrfKey
  });

  $.ajax({
    type: 'POST',
    url: '/gerrit_ui/rpc/ChangeDetailService',
    headers: {
      'Accept': 'application/json,application/json,application/jsonrequest',
      'Content-Type': 'application/json; charset=UTF-8'
    },
    data: data,
    success: function(resp, a, xhr) {
      window.callPhantom({
        success: true,
        patchId: patchId,
        status: xhr.status,
        body: resp
      });
    },
    error: function(error, a, b) {
      window.callPhantom({
        patchId: patchId,
        failed: true,
        status: error.status,
        body: error.responseText
      });
    }
  });

  return true;
};