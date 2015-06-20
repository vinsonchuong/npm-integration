#!/usr/bin/env node
var execSync = require('child_process').execSync;
var path = require('path');

var linkDependencies = Object(
  require(path.resolve('package.json')).linkDependencies);
Object.keys(linkDependencies).forEach(function(dependencyName) {
  var dependencyPath = linkDependencies[dependencyName];
  process.stdout.write([
    'Cloning "vinsonchuong/',
    dependencyName,
    '" to "',
    dependencyPath,
    '"...'
  ].join(''));
  try {
    execSync([
      'git clone \'https://github.com/vinsonchuong/',
      dependencyName,
      '\' \'',
      dependencyPath,
      '\''
    ].join(''), {stdio: ['pipe', 'pipe', 'pipe']});
    process.stdout.write('done');
  } catch (e) {
    if (e.message.match(/destination path .*? already exists/)) {
      process.stdout.write('already cloned');
    } else {
      throw e;
    }
  } finally {
    process.stdout.write('\n');
  }
});
