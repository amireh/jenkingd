var JENKINS_ID = 1000008;
var BASE_JOB_URL = 'http://jenkins.instructure.com/job';
var LINK_EXTRACTOR = /Build Started (http:\/\/jenkins[^\s]+)\s/;
var ID_EXTRACTOR = /job\/([^\/]+)\/([^\/]+)\/$/; // extract project and job ids

module.exports = function extractLinks(resp) {
  var messages, projects, links, latestPS;
  var data = resp;
  var MESSAGE_FILTER = new RegExp('^Patch Set' + latestPS + ':');

  latestPS = data.currentPatchSetId.patchSetId;

  console.log('PatchSet:', latestPS);

  messages = data.messages
    // Get the latest patchset messages:
    .filter(function(message) {
      return message.patchset && message.patchset.patchSetId === latestPS;
    })
    // Only the ones made by Jenkins:
    .filter(function(message) {
      if (message.hasOwnProperty('author')) {
        return message.author.id === JENKINS_ID;
      }
      else {
        return message.message.match(MESSAGE_FILTER);
      }
    });

  console.log('Found', messages.length, 'messages by Jenkins.');

  links = messages.map(function(message) {
    var message = message.message;
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
    return links[projectId];
  });

  return links;
};