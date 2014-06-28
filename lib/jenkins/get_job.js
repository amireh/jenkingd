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

module.exports = function(link) {
  return new RSVP.Promise(function(resolve, reject) {
    var xhr;

    xhr = new XMLHttpRequest();
    xhr.open('GET', link + '/api/json', true);
    xhr.onreadystatechange = function() {
      var job;

      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          job = JSON.parse(xhr.responseText);

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
        else {
          reject({
            status: xhr.status,
            message: xhr.status === 404 ? 'not found' : xhr.responseText
          });
        }
      }
    };

    xhr.setRequestHeader('Accept', 'application/json');
    xhr.send();
  });
};