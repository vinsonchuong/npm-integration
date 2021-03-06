import {fs, childProcess} from 'node-promise-es6';

async function run() {
  const {linkDependencies = {}} = JSON.parse(await fs.readFile('package.json', 'utf8'));
  for (const dependencyName of Object.keys(linkDependencies)) {
    const dependencyPath = linkDependencies[dependencyName];

    const {stdout: diff} = await childProcess.exec('git diff', {cwd: dependencyPath});
    if (!diff.trim()) {
      continue;
    }

    process.stdout.write(`Committing 'vinsonchuong/${dependencyName}'\n`);
    process.stdout.write(`${diff}\n`);

    await childProcess.exec(
      "git config user.email 'vinsonchuong@gmail.com'",
      {cwd: dependencyPath}
    );
    await childProcess.exec(
      "git config user.name 'Vinson Chuong'",
      {cwd: dependencyPath}
    );
    await childProcess.exec(
      [
        'git commit',
        "-m 'Automatically update dependencies'",
        'package.json'
      ].join(' '),
      {cwd: dependencyPath}
    );
    await childProcess.exec(
      [
        'git push',
        `https://${process.env.GITHUB_TOKEN}@github.com/vinsonchuong/${dependencyName}`,
        'master'
      ].join(' '),
      {cwd: dependencyPath}
    );
  }
}

run().catch((error) => {
  process.stderr.write(`${error.stack}\n`);
  /* eslint-disable lines-around-comment, no-process-exit */
  process.exit(1);
  /* eslint-enable lines-around-comment, no-process-exit */
});
