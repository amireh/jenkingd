var fs = require('fs');
var logHtml = fs.readFileSync('test/fixture/job_console.html');
var extractLog = require('../lib/jenkins/get_job_log/extract_log');

describe('extractLog', function() {
  it('should get whats inside the <pre />', function() {
    var lines = extractLog(String(logHtml)).split('\n');
    expect(lines.length).toEqual(793);
    expect(lines[0]).toMatch(/^ializers/);
    expect(lines[792]).toEqual('Finished: FAILURE');
  });
});