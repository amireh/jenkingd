var stripLog = require('../../lib/jenkins/get_job_log/strip_log');

describe('Jenkins#stripLog', function() {
  it('should remove unwanted lines', function() {
    var log = stripLog('foobar\nDEPRECATION WARNING: calling #iconv will ...\n\nfoo',
      [
        /^DEPRECATION/
      ]);
    expect(log).toEqual('foobar\nfoo');
  });

  it('should remove unwanted parts', function() {
    var log = stripLog('00:23:11 foobar', [], [
      /\d{2}:\d{2}:\d{2}\s*/
    ]);

    expect(log).toEqual('foobar');
  });
})