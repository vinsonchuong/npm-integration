import fs from 'node-promise-es6/fs';
import path from 'path';

async function run() {
  const {linkDependencies = {}} = await fs.readJson('package.json');

  try {
    await fs.mkdir(path.resolve('spec'));
  } catch (error) {
    if (error.code !== 'EEXIST') {
      throw error;
    }
  }

  try {
    await fs.mkdir(path.resolve('spec/integration'));
  } catch (error) {
    if (error.code !== 'EEXIST') {
      throw error;
    }
  }

  await* Object.keys(linkDependencies)
    .map(async dependencyName => {
      try {
        await fs.unlink(path.resolve('spec/integration', dependencyName));
      } catch (error) {
        if (error.code !== 'ENOENT') {
          throw error;
        }
      }
      await fs.symlink(
        path.resolve(linkDependencies[dependencyName], 'spec'),
        path.resolve('spec/integration', dependencyName)
      );
    });
}

run().catch(error => {
  process.stderr.write(`${error.stack}\n`);
  process.exit(1);
});
