import Joi from '@hapi/joi';
import { NowRequest, NowResponse } from '@now/node';
import bcrypt from 'bcryptjs';
import cookie from 'cookie';

// XXX: Maybe store dbkey in Firebase functions config
// only problem is to figure out how to programmatically set config values from script.
// don't like the idea of using CLI as not everyone who'd want to use this would have that installed.
import { DbKey, firestore } from '../../lib/db';
import withValidate from '../../lib/withValidate';

const dbKeys = firestore.collection<DbKey>({ path: 'dbkeys' });

// eslint-disable-next-line
const handler = async (req: NowRequest, res: NowResponse) => {
  const { key: mnemonic } = req.body as { key: string };
  const keys = await dbKeys.fetchAll();

  if (
    // Check if any of the keys match the user's given one.
    // Ideally there'd only be one key in the DB, but you never know.
    // XXX: Maybe store dbkey in Firebase functions config
    !(await Promise.all(
      keys.map(row => bcrypt.compare(mnemonic, row.content))
    )).some(x => x)
  )
    return res.status(400).json({ error: 'Invalid auth key' });

  // FIXME: should probably use JWT
  const encodedKey = Buffer.from(mnemonic).toString('base64');

  res.setHeader(
    'Set-Cookie',
    cookie.serialize('token', encodedKey, { expires: new Date(2147483647000) })
  );
  res.json({ key: encodedKey });
};

const schema = Joi.object().keys({ key: Joi.string() });

export default withValidate(schema, handler);
