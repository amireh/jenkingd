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
            success: job.result === 'SUCCESS',
            status: job.result
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