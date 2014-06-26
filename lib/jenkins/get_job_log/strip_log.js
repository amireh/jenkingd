var config = require('../../config');

function stripLog(str, filters, sanitizers) {
  var lines = String(str).split("\n");

  filters = filters || config.logFilters;
  sanitizers = sanitizers || config.logSanitizers;

  return lines.map(function(line) {
    return line.trim();
  }).filter(function(line) {
    return filters.filter(function(filter) {
      return line.match(filter);
    }).length === 0;
  }).map(function(line) {
    return sanitizers.reduce(function(newLine, sanitizer) {
      return newLine.replace(sanitizer, '');
    }, line);
  }).filter(function(line) {
    return line.trim().length > 0;
  }).join("\n");
}

module.exports = stripLog;