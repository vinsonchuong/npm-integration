#!/usr/bin/env node

/* eslint-disable no-sync */

const execSync = require('child_process').execSync;
const path = require('path');

const linkDependencies = Object(
  require(path.resolve('package.json')).linkDependencies);
Object.keys(linkDependencies).forEach((dependencyName) => {
  const dependencyPath = linkDependencies[dependencyName];
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
