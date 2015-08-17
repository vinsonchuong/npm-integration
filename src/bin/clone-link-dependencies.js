#!/usr/bin/env node

/* eslint-disable no-var, no-sync */

var execSync = require('child_process').execSync;
var path = require('path');

var linkDependencies = Object(
  require(path.resolve('package.json')).linkDependencies);
Object.keys(linkDependencies).forEach(function cloneDependency(dependencyName) {
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
    execSync('npm install', {cwd: dependencyPath}, {stdio: ['pipe', 'pipe', 'pipe']});
    process.stdout.write('done');
  } catch (error) {
    if (error.message.match(/destination path .*? already exists/)) {
      process.stdout.write('already cloned');
    } else {
      throw error;
    }
  } finally {
    process.stdout.write('\n');
  }
});
