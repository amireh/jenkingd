#!/usr/bin/env phantomjs

/* jslint node: true */

require('./config');
require('./ext/phantomjs'); // Function.bind polyfill

var gerrit = require('./gerrit');
var jenkins = require('./jenkins');
var K = require('./constants');
var server = require('webserver').create();
var RSVP = require('rsvp');
var service;

var parseJobLink = function(request, respond) {
  var jobLink = (request.url.match(/\?link=(.+)$/) || [])[1];

  if (!jobLink) {
    return respond(400, {
      message: K.ERROR_MISSING_JOB_LINK
    });
  }

  return decodeURIComponent(jobLink);
};

var routes = [
  { // sneak into Gerrit and Jenkins and get ready for hackery
    url: '/connect',

    /**
     * Credentials must be provided in the HTTP Basic Authentication form, ie,
     * in the "Authorization" header.
     */
    handler: function(request, respond, onError) {
      var authToken = request.headers.authorization ||
        request.headers.Authorization;

      console.log(JSON.stringify(request));

      if (!authToken) {
        return respond(400, { message: K.ERROR_MISSING_CREDENTIALS });
      }

      console.log('Authorization token:', authToken);

      RSVP.all([
        gerrit.connect(authToken),
        jenkins.connect()
      ]).then(function() {
        respond(200, {});
      }, onError);
    }
  },

  { // leave like a gentleman would
    url: '/disconnect',
    handler: function(request, respond, onError) {
      RSVP.all([
        gerrit.disconnect(),
        jenkins.disconnect()
      ]).then(function() {
        respond(200, {});
      }, onError);
    }
  },

  { // patch listing
    url: '/patches',
    handler: function(request, respond, onError) {
      gerrit.getPatches().then(function(patchIds) {
        respond(200, patchIds);
      }, onError);
    }
  },

  { // patch listing
    url: /^\/patches\?query=(.*)$/,
    handler: function(request, respond, onError) {
      var query = decodeURIComponent(request.url.match(this.url)[1]);

      gerrit.getPatches(query).then(function(patchIds) {
        respond(200, patchIds);
      }, onError);
    }
  },

  { // patch info
    url: /^\/patches\/(\d+)/,
    handler: function(request, respond, onError) {
      var patchId = request.url.match(this.url)[1];

      gerrit.getPatch(patchId).then(function(patch) {
        respond(200, patch);
      }, onError);
    }
  },

  { // retrieve build job status
    url: /^\/job\?link=(.*)$/,
    handler: function(request, respond, onError) {
      var jobLink = parseJobLink(request, respond);

      jenkins.getJob(jobLink).then(function(jobStatus) {
        respond(200, jobStatus);
      }, onError);
    }
  },

  { // retrieve build job log
    url: /^\/job\/log\?link=(.*)$/,
    handler: function(request, respond, onError) {
      var jobLink = parseJobLink(request, respond);

      jenkins.getJobLog(jobLink).then(function(jobLog) {
        respond(200, jobLog);
      }, onError);
    }
  },

  { // retrigger the job
    url: /^\/job\/retrigger\?link=(.*)$/,
    handler: function(request, respond, onError) {
      var jobLink = parseJobLink(request, respond);

      jenkins.retrigger(jobLink).then(function() {
        jenkins.getJob(jobLink).then(function(jobStatus) {
          respond(200, jobStatus);
        });
      }, onError);
    }
  },

  {
    url: '/status',
    handler: function(request, respond) {
      respond(200, {
        connected: gerrit.isConnected() && jenkins.isConnected()
      });
    }
  },

  {
    url: '/shutdown',
    handler: function(request, respond) {
      console.log('jenkingd: closing server');
      respond(200, {});
      server.close();
      // phantom.exit(0);
    }
  },

  { // 404
    url: /.*/,
    handler: function(request, respond) {
      respond(404, { message: K.ERROR_NOT_FOUND });
    }
  }
];

service = server.listen(8777, function(request, response) {
  var i, route;
  var url = request.url;
  var timeout;
  var respond = function(code, data) {
    var buffer = JSON.stringify(data || '{}');

    clearTimeout(timeout);
    timeout = null;

    response.statusCode = code;
    response.setHeader('Content-Type', 'application/json; charset=UTF-8');
    response.write(buffer);
    response.closeGracefully();
  };

  console.log('Request: [', request.method, '] =>', request.url);

  timeout = setTimeout(function() {
    respond(500, { status: 'timeout' });
  }, K.REQUEST_TIMEOUT);

  for (i = 0; i < routes.length; ++i) {
    route = routes[i];

    if (route.method && route.method !== request.method) {
      continue;
    }

    if (typeof route.url === 'string') {
      if (route.url === url)  {
        break;
      }
    }
    else if (route.url.test(url)) {
      break;
    }
  }

  try {
    route.handler.call(route, request, respond, function onServiceError(error) {
      console.log('Gerrit/Jenkins error:', JSON.stringify(error));
      respond(error.status, {
        code: error.code,
        message: error.message
      });
    });
  }
  catch(e) {
    console.error('Handler error:');
    console.error(e.stack);

    respond(500, { message: 'internal jenkingd error' });
  }
});

if (service) {
  console.log('jekningd: listening on 8777');
} else {
  console.error('jenkingd: [ERROR] unable to bind to http://localhost:8777');
  phantom.exit(1);
}