var filters = [
  /^DEPRECATION/,
  'WARNING: trigger group has an explicit name, but nested triggers do not. trigger names will be inferred',
  /iconv will be deprecated in the future/,
  'Code coverage not enabled',
  'Bullet not enabled'
];

function stripLog(str) {
  var lines = String(str).split("\n");
  return lines.filter(function(line) {
    return filters.filter(function(filter) {
      return line.match(filter);
    }).length === 0;
  }).join("\n");
}

module.exports = stripLog;