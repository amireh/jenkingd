var RSVP = require('rsvp');
var path = require('path');
var fs = require('fs');
var home = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
var configPath = path.join(home || __dirname, '.jenkingd');
var config = {};

function extend() {
  var i, key;

  for (i = 1; i < arguments.length; i++) {
    for (key in arguments[i]) {
      if (arguments[i].hasOwnProperty(key)) {
        arguments[0][key] = arguments[i][key];
      }
    }
  }

  return arguments[0];
};

RSVP.configure('onerror', function(e) {
  console.log('RSVP error:', e);

  if (e && e.message) {
    console.log(e.message);
  }
  if (e && e.stack) {
    console.log(e.stack);
  }
});

if (fs.existsSync(configPath)) {
  config = require(configPath);
}

extend(config, {
  logFilters: [
    /^DEPRECATION/,
    'WARNING: trigger group has an explicit name, but nested triggers do not. trigger names will be inferred',
    /iconv will be deprecated in the future/,
    'Code coverage not enabled',
    'Bullet not enabled',
    /^$/
  ],

  logSanitizers: [
    // 1234: 00:00:00.4444
    /^\d+:\s\d{2}:\d{2}:\d{2}\.\d+\s*/g
  ]
});

module.exports = config;