var RSVP = require('rsvp');
var webpage = require('webpage');
var K = require('./constants');
var retrigger = require('./jenkins/retrigger');
var getJob = require('./jenkins/get_job');
var getJobLog = require('./jenkins/get_job_log');

var page;
var connected = false;

/**
 * @internal Reset state.
 */
var reset = function() {
  if (page) {
    page.close();
    page = undefined;
  }

  connected = false;
};

var prepareSession = function(resolve, reject, xhr) {
  if (xhr.url === K.JENKINS_URL) {
    if (xhr.status === 200) {
      console.log('Connected to Jenkins.');
      connected = true;
      resolve();
    }
    else {
      reset();

      reject({
        status: xhr.status,
        code: xhr.statusText
      });
    }
  }
};

var connect = function() {
  if (connected) {
    return RSVP.resolve();
  }

  page = webpage.create();
  page.settings.loadImages = false;

  return new RSVP.Promise(function(resolve, reject) {
    page.onResourceReceived = prepareSession.bind(null, resolve, reject);
    page.open(K.JENKINS_URL);
  }).then(function() {
    page.onResourceReceived = null;
    return true;
  });
};

var disconnect = function() {
  return new RSVP.Promise(function(resolve, reject) {
    if (connected) {
      reset();
      resolve();
    }
    else {
      reject({
        status: 400,
        code: K.ERROR_DISCONNECTED
      });
    }
  });
};

module.exports = {
  /**
   * Visit Jenkins to prepare for retriggering later. Make sure you are
   * connected to the VPN before calling this!
   *
   * @return {RSVP.Promise}
   */
  connect: connect,

  /**
   * Close the Jenkins page.
   *
   * @return {RSVP.Promise}
   */
  disconnect: disconnect,

  isConnected: function() {
    return !!connected;
  },

  getJob: function(jobLink) {
    return getJob(jobLink);
  },

  getJobLog: function(jobLink) {
    return getJobLog(jobLink);
  },

  retrigger: function(jobLink) {
    return retrigger(jobLink, page);
  }
};