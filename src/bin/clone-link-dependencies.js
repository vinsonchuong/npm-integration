import {exec} from 'node-promise-es6/child-process';
import fs from 'node-promise-es6/fs';

async function run() {
  const {linkDependencies = {}} = await fs.readJson('package.json');
  for (const dependencyName of Object.keys(linkDependencies)) {
    const dependencyPath = linkDependencies[dependencyName];
    process.stdout.write(
      `Cloning 'vinsonchuong/${dependencyName}' to '${dependencyPath}'...`);
    try {
      await exec(
        `git clone 'https://github.com/vinsonchuong/${dependencyName}' '${dependencyPath}'`);
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
  }
}

run().catch(e => {
  process.stderr.write(`${e.stack}\n`);
  process.exit(1);
});
