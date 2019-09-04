const bcrypt = require('bcryptjs');
const bip39 = require('bip39');
const clipboardy = require('clipboardy');
const c = require('colorette');
const { prompt } = require('enquirer');
const ora = require('ora');
const mysql = require('serverless-mysql');
const sql = require('sql-template-strings');

const { randomBytes } = require('crypto');

// Load root .env config like `now dev` would.
require('dotenv').config();

const asyncBytes = s =>
  new Promise((resolve, reject) =>
    randomBytes(s, (err, buf) => (err ? reject(err) : resolve(buf)))
  );

const hasEnvVars = !!(
  process.env.MYSQL_HOST &&
  process.env.MYSQL_USER &&
  process.env.MYSQL_PASSWORD &&
  process.env.MYSQL_DATABASE
);

const db = mysql({
  config: {
    host: process.env.MYSQL_HOST,
    database: process.env.MYSQL_DATABASE,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD
  }
});

async function query(strings, ...values) {
  const res = await db.query(sql(strings, ...values));

  await db.end();
  return res;
}

async function main() {
  if (!hasEnvVars) {
    console.log(
      c.red(
        c.bold(
          'It looks like you are missing the environment variables required for the script to run.'
        )
      )
    );
    console.log(
      c.red(
        c.bold(
          'Try adding them in a `.env` file, or adding them directly to your environment variables.'
        )
      )
    );
    console.log(
      c.red(
        c.bold(
          'For information on the required environment variables, refer to the env section of `now.json`.'
        )
      )
    );
    process.exit(0);
  }

  const [alreadyGenerated] = await query`SELECT content FROM redirect_keys`;

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
  const mnemonic = bip39.entropyToMnemonic(bytes);
  const hash = await bcrypt.hash(mnemonic, 12);

  genSpinner.succeed();

  const storeSpinner = ora({
    text: 'Storing passphase',
    spinner: 'dots11'
  }).start();

  if (alreadyGenerated) await query`UPDATE redirect_keys SET content = ${hash}`;
  else await query`INSERT INTO redirect_keys (content) VALUES (${hash})`;

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

main();
