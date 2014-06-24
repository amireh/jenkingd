#!/usr/bin/env node

var extractLog = require('../extract_log');
var fs = require('fs');
var logHtml = fs.readFileSync('../fixture/job_console.html');
var lines = extractLog(String(logHtml)).split("\n");

console.log(lines.length, 'lines');
console.log('Starting line:', lines[0]);
console.log('Ending line:', lines[lines.length-1]);
