var K = require('../../constants');

var JENKINS_ID = K.JENKINS_ID;
var BASE_JOB_URL = 'http://jenkins.instructure.com/job';
var LINK_EXTRACTOR = /Build Started (http:\/\/jenkins[^\s]+)/;
var ID_EXTRACTOR = /job\/([^\/]+)\/([^\/]+)\/$/; // extract project and job ids

module.exports = function extractLinks(data) {
  var messages, projects, links, latestPS;
  var MESSAGE_FILTER = new RegExp('^Patch Set' + latestPS + ':');

  if (data.revisions) {
    latestPS = data.revisions[data.revisions.length-1]._number;
  }
  else {
    latestPS = 1;
  }

  messages = data.messages
    // Get the latest patchset messages:
    .filter(function(message) {
      return message._revision_number === latestPS;
    })
    // Only the ones made by Jenkins:
    .filter(function(message) {
      if (message.hasOwnProperty('author')) {
        return message.author._account_id === JENKINS_ID;
      }
      else {
        return message.message.match(MESSAGE_FILTER);
      }
    });

  console.log('Found', messages.length, 'messages by Jenkins.');

  links = messages.map(function(messageEntity) {
    var message = messageEntity.message;
    var capture = message.match(LINK_EXTRACTOR);

    if (capture) {
      return capture[1];
    }
  }).filter(function(link) {
    return !!link;
  }).reduce(function(links, link) {
    var project, jobId;
    var capture = link.match(ID_EXTRACTOR);

    if (capture) {
      projectId = capture[1];
      jobId = capture[2];

      links[projectId] = [ BASE_JOB_URL, projectId, jobId ].join('/');
    } else {
      console.warn('Unable to extract project and job IDs from link:', link);
    }

    return links;
  }, {});

  links = Object.keys(links).map(function(projectId) {
    return links[projectId].trim().replace(/\/$/, '');
  });

  return links;
};