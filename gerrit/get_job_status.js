var RSVP = require('rsvp');

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
            id: job.number,
            active: job.building,
            label: job.fullDisplayName,
            success: job.result === 'SUCCESS',
            status: job.result,
            duration: job.duration,
            estimatedDuration: job.estimatedDuration,
            startedAt: job.timestamp,
            url: job.url
          });
        }
        else {
          reject({
            status: xhr.status,
            message: xhr.responseText
          });
        }
      }
    };

    xhr.setRequestHeader('Accept', 'application/json');
    xhr.send();
  });
};