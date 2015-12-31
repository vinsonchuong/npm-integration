import {fs, childProcess} from 'node-promise-es6';
import path from 'path';

async function run() {
  const {linkDependencies = {}} = JSON.parse(
    await fs.readFile(path.resolve('package.json'), 'utf8'));

  const packages = [];
  for (const link of Object.keys(linkDependencies)) {
    const linkPackageJsonPath = path.resolve('node_modules', link, 'package.json');
    const {dependencies = {}} = JSON.parse(
      await fs.readFile(linkPackageJsonPath, 'utf8'));
    for (const dependency of Object.keys(dependencies)) {
      if (!linkDependencies.hasOwnProperty(dependency)) {
        packages.push(dependency);
      }
    }
  }

  const installArgs = packages.map(name => `'${name}@*'`).join(' ');
  if (!installArgs) {
    return;
  }
  const {stdout} = await childProcess.exec(`npm install ${installArgs}`);
  if (stdout.trim()) {
    process.stdout.write(`${stdout}\n`);
  }

  const newestPackageJsons = await Promise.all(
    packages.map(async name =>
      JSON.parse(await fs.readFile(
        path.resolve('node_modules', name, 'package.json'), 'utf8')))
  );

  const newestPackageVersions = newestPackageJsons.reduce(
    (memo, packageJson) =>
      Object.assign(memo, {[packageJson.name]: packageJson.version}),
    {}
  );

  const updatedPackages = {};
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
