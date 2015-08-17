import {exec} from 'node-promise-es6/child-process';
import fs from 'node-promise-es6/fs';
import path from 'path';

async function run() {
  const directories = await fs.readdir('node_modules');
  const packages = [];
  for (const directory of directories) {
    if (directory === '.bin') {
      continue;
    }

    const stat = await fs.lstat(path.resolve('node_modules', directory));
    if (stat.isSymbolicLink()) {
      continue;
    }

    packages.push(directory);
  }

  const installArgs = packages.map(name => `'${name}@*'`).join(' ');
  if (!installArgs) {
    return;
  }
  const {stdout} = await exec(`npm install ${installArgs}`);
  if (stdout.trim()) {
    process.stdout.write(`${stdout}\n`);
  }

  const newestPackageJsons = await* packages.map(async name =>
    JSON.parse(await fs.readFile(
      path.resolve('node_modules', name, 'package.json'), 'utf8'))
  );
  const newestPackageVersions = newestPackageJsons.reduce(
    (memo, packageJson) =>
      Object.assign(memo, {[packageJson.name]: packageJson.version}),
    {}
  );

  const updatedPackages = {};
  const {linkDependencies = {}} = JSON.parse(
    await fs.readFile(path.resolve('package.json'), 'utf8'));
  for (const link of Object.keys(linkDependencies)) {
    const linkPackageJson = JSON.parse(await fs.readFile(
      path.resolve(linkDependencies[link], 'package.json'), 'utf8'));
    updatedPackages[link] = {};
    newestPackageVersions[link] = linkPackageJson.version;
  }
  for (const link of Object.keys(linkDependencies)) {
    const linkPackageJsonPath = path.resolve(
      linkDependencies[link], 'package.json');
    const linkPackageJson = JSON.parse(await fs.readFile(
      linkPackageJsonPath, 'utf8'));
    const {dependencies = {}} = linkPackageJson;
    for (const dependency of Object.keys(dependencies)) {
      const newVersion = `^${newestPackageVersions[dependency]}`;
      if (linkPackageJson.dependencies[dependency] !== newVersion) {
        updatedPackages[link][dependency] = newVersion;
        linkPackageJson.dependencies[dependency] = newVersion;
      }
    }
    await fs.writeFile(
      linkPackageJsonPath, JSON.stringify(linkPackageJson, null, 2) + '\n');
  }

  process.stdout.write('Updated Packages:\n');
  process.stdout.write(JSON.stringify(updatedPackages, null, 2) + '\n');
}

run().catch(error => {
  process.stderr.write(`${error.stack}\n`);
  process.exit(1);
});
