import {fs} from 'node-promise-es6';
import path from 'path';

async function run() {
  const {linkDependencies = {}} = JSON.parse(await fs.readFile('package.json', 'utf8'));

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

  await Promise.all(
    Object.keys(linkDependencies)
      .map(async (dependencyName) => {
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
      })
  );
}

run().catch((error) => {
  process.stderr.write(`${error.stack}\n`);
  /* eslint-disable lines-around-comment, no-process-exit */
  process.exit(1);
  /* eslint-enable lines-around-comment, no-process-exit */
});
