#!/usr/bin/env phantomjs

var gerrit = require('./gerrit');
var authToken;

var routes = [
  { // sneak into gerrit and get ready for hackery
    url: '/connect',
    method: 'POST',

    /**
     * Accepts credentials in two forms:
     *
     *  1. HTTP Basic Authorization (e.g, "Authorization" header must be set)
     *  2. JSON payload with "username" and "password" fields
     *
     */
    handler: function(request, respond) {
      var payload;

      if (request.headers['Authorization']) {
        authToken = request.headers['Authorization'];
      }
      else if (request.postRaw.length) {
        payload = JSON.parse(request.postRaw);
        authToken = 'Basic ' + btoa(payload.username + ":" + payload.password);
      }
      else {
        return respond(400, {
          status: 'error',
          message: 'missing credentials'
        });
      }

      console.log('Authorization token:', authToken);

      gerrit.connect(authToken).then(function() {
        respond(200, {});
      }, function(error) {
        console.warn('Connecting to gerrit failed!', JSON.stringify(error));
        respond(error.status, { message: error.message })
      });
    }
  },

  { // leave like a gentleman would
    url: '/disconnect',
    handler: function(req, respond) {
      gerrit.disconnect().then(function() {
        respond(200, {});
      }, function(error) {
        respond(400, { message: error });
      });
    }
  },

  { // patch listing
    url: '/patches',
    handler: function(req, respond) {
      console.log('Getting patch list.');
      respond(200, []);
    }
  },

  { // 404
    url: /.*/,
    handler: function(req, respond) {
      console.log('404 - Not found.');
      respond(404, { status: 'error', message: 'Not Found' });
    }
  }
];

var server = require('webserver').create();
var service = server.listen(8777, function(request, response) {
  var i, route;
  var url = request.url;
  var timeout;
  var respond = function(code, data) {
    clearTimeout(timeout);
    timeout = null;

    response.statusCode = code;
    response.write(JSON.stringify(data));
    response.close();
  };

  timeout = setTimeout(function() {
    respond(500, { status: 'timeout' });
  }, 10000);

  // console.log(JSON.stringify(request));

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
    route.handler(request, respond);
  }
  catch(e) {
    console.error('Handler error:');
    console.error(e.stack);

    respond(500, { status: 'error' });
  }
});

console.log('jekningd: listening on 8777');