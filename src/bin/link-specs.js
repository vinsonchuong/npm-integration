import fs from 'node-promise-es6/fs';
import path from 'path';

async function run() {
  const {linkDependencies = {}} = await fs.readJson('package.json');

  try {
    await fs.mkdir(path.resolve('spec'));
  } catch (e) {
    if (e.code !== 'EEXIST') {
      throw e;
    }
  }

  try {
    await fs.mkdir(path.resolve('spec/integration'));
  } catch (e) {
    if (e.code !== 'EEXIST') {
      throw e;
    }
  }

  await* Object.keys(linkDependencies)
    .map(async dependencyName => {
      try {
        await fs.unlink(path.resolve('spec/integration', dependencyName));
      } catch (e) {
        if (e.code !== 'ENOENT') {
          throw e;
        }
      }
      await fs.symlink(
        path.resolve(linkDependencies[dependencyName], 'spec'),
        path.resolve('spec/integration', dependencyName)
      );
    });
}

run().catch(e => {
  process.stderr.write(`${e.stack}\n`);
  process.exit(1);
});
