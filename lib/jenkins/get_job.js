var RSVP = require('rsvp');
var extractPatchId = function(job) {
  var parameter = job.actions.filter(function(action) {
    return !!action.parameters;
  }).map(function(action) {
    return action.parameters;
  }).map(function(params) {
    return params.filter(function(param) {
      return param.name === 'GERRIT_CHANGE_NUMBER';
    })[0];
  })[0];

  return (parameter || {}).value;
};

module.exports = function(link, page) {
  return new RSVP.Promise(function(resolve, reject) {
    var targetUrl = link + '/api/json';
    page.onResourceReceived = function(xhr) {
      if (xhr.url === targetUrl) {
        if (xhr.status !== 200) {
          reject({
            status: xhr.status,
            message: xhr.status === 404 ? 'not found' : xhr.responseText
          });
        }
      }
    };

    page.open(targetUrl, function(status) {
      if (status === 'success') {
        var job;

        try {
          job = JSON.parse(page.plainText || '{}');
        } catch(e) {
          console.warn("Unable to parse Job payload.");
          console.warn(JSON.stringify(page));

          if (page.plainText.match(/HTTP Status 404/)) {
            return reject({
              status: 404,
              message: 'not found'
            });
          }
          else {
            return reject({
              status: 500,
              message: "unable to parse job payload"
            });
          }
        }

        resolve({
          id: ''+job.number,
          patchId: extractPatchId(job),
          active: job.building,
          label: job.fullDisplayName,
          success: job.result === 'SUCCESS',
          status: job.result,
          duration: job.duration,
          estimatedDuration: job.estimatedDuration,
          startedAt: job.timestamp,
          url: job.url.trim().replace(/\/$/, '')
        });
      }
    });
  });
};