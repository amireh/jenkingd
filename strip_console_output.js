#!/usr/bin/env node

var fs = require('fs');
var src = process.argv[2];
var dst = process.argv[3];
var filters = [
  /^DEPRECATION/,
  'WARNING: trigger group has an explicit name, but nested triggers do not. trigger names will be inferred',
  /iconv will be deprecated in the future/,
  'Code coverage not enabled',
  'Bullet not enabled'
];

console.log('Stripping:', src);
console.log('Stripped version will be found at:', dst);

var srcFile = fs.readFileSync(src);
var lines = String(srcFile).split("\n");
var stripped = lines.filter(function(line) {
  return filters.filter(function(filter) {
    return line.match(filter);
  }).length === 0;
});

console.log('Down from', lines.length, 'to', stripped.length, 'lines.');

fs.writeFileSync(dst, stripped.join("\n"))