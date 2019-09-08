import bcrypt from 'bcryptjs';
import { entropyToMnemonic } from 'bip39';
import clipboardy from 'clipboardy';
import c from 'colorette';
import { prompt } from 'enquirer';
import ora from 'ora';

import { randomBytes } from 'crypto';

import { DbKey, firestore } from '../lib/db';

// Load root .env config like `now dev` would.
require('dotenv').config(); // eslint-disable-line @typescript-eslint/no-require-imports

const asyncBytes = (size: number): Promise<Buffer> =>
  new Promise((resolve, reject) =>
    randomBytes(size, (err, buf) => (err ? reject(err) : resolve(buf)))
  );

const dbKeys = firestore.collection<DbKey>({ path: 'dbkeys' });

async function main() {
  // if (!hasEnvVars) {
  //   console.log(
  //     c.red(
  //       c.bold(
  //         'It looks like you are missing the environment variables required for the script to run.'
  //       )
  //     )
  //   );
  //   console.log(
  //     c.red(
  //       c.bold(
  //         'Try adding them in a `.env` file, or adding them directly to your environment variables.'
  //       )
  //     )
  //   );
  //   console.log(
  //     c.red(
  //       c.bold(
  //         'For information on the required environment variables, refer to the env section of `now.json`.'
  //       )
  //     )
  //   );
  //   process.exit(0);
  // }

  const alreadyGenerated = !!(await dbKeys.fetchAll()).length;

  if (alreadyGenerated) {
    const { confirmExists } = await prompt({
      type: 'confirm',
      name: 'confirmExists',
      message:
        'It looks like you have already generated a passphrase. Are you sure you want to regenerate it?'
    });

    if (!confirmExists) {
      console.log('Exiting...');
      process.exit(0);
    }
  }

  const genSpinner = ora({
    text: 'Generating passphrase',
    spinner: 'dots11'
  }).start();

  const bytes = (await asyncBytes(16)).toString('hex');
  const mnemonic = entropyToMnemonic(bytes);
  const hash = await bcrypt.hash(mnemonic, 12);

  genSpinner.succeed();

  const storeSpinner = ora({
    text: 'Storing passphase',
    spinner: 'dots11'
  }).start();

  if (alreadyGenerated) {
    const [{ id }] = await dbKeys.fetchAll();
    await dbKeys.set({ id, content: hash });
  } else await dbKeys.add({ content: hash });

  await clipboardy.write(mnemonic);

  storeSpinner.succeed();

  console.log();
  console.log(
    c.green('√ '),
    'Your passphrase has been stored, and is now ready to use when micro-link is deployed!',
    '\n'
  );
  console.log('  ', c.green('Your passphrase is:'));
  console.log('    ', c.bold(mnemonic));
  console.log('\n  ', c.green('It has also been copied to your clipboard.'));

  process.exit(0);
}

main().catch(err => {
  throw err;
});
