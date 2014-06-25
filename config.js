var RSVP = require('rsvp');

RSVP.configure('onerror', function(e) {
  console.log('RSVP error:', e);

  if (e && e.message) {
    console.log(e.message);
  }
  if (e && e.stack) {
    console.log(e.stack);
  }
});