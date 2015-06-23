import {exec} from 'node-promise-es6/child-process';
import fs from 'node-promise-es6/fs';

async function run() {
  const {linkDependencies = {}} = await fs.readJson('package.json');
  for (const dependencyName of Object.keys(linkDependencies)) {
    const dependencyPath = linkDependencies[dependencyName];

    const {stdout: diff} = await exec(
      'git diff-index HEAD', {cwd: dependencyPath});
    if (diff.trim().indexOf('package.json') === -1) { continue; }

    process.stdout.write(diff + '\n');
    process.stdout.write(`Committing 'vinsonchuong/${dependencyName}'\n`);

    await exec(
      `git config user.email 'vinsonchuong@gmail.com'`,
      {cwd: dependencyPath}
    );
    await exec(
      `git config user.name 'Vinson Chuong'`,
      {cwd: dependencyPath}
    );
    await exec(
      [
        'git commit',
        `-m 'Automatically update dependencies'`,
        'package.json'
      ].join(' '),
      {cwd: dependencyPath}
    );
    await exec(
      [
        'git push',
        `https://${process.env.GITHUB_TOKEN}@github.com/vinsonchuong/${dependencyName}`,
        'master'
      ].join(' '),
      {cwd: dependencyPath}
    );
  }
}

run().catch(e => {
  process.stderr.write(`${e.stack}\n`);
  process.exit(1);
});
