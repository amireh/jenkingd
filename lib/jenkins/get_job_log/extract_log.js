/**
 * Given a Jenkins /job/console HTML file, this function extracts the relevant
 * spec log output.
 *
 * @param  {String} logHtml
 *         The HTML source of what you get by querying
 *         https://jenkins.instructure.com/job/:project/:id/console
 *
 * @return {String}
 *         The extracted log substring.
 */
function extractLog(logHtml) {
  var start = '<pre class="console-output">';
  var end = '</pre>';

  return logHtml.substring(
    logHtml.indexOf(start) + start.length,
    logHtml.indexOf(end)-1
  );
}

module.exports = extractLog;