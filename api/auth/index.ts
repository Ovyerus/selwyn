import Joi from '@hapi/joi';
import { NowRequest, NowResponse } from '@now/node';
import bcrypt from 'bcryptjs';
import cookie from 'cookie';

// XXX: Maybe store dbkey in Firebase functions config
// only problem is to figure out how to programmatically set config values from script.
// don't like the idea of using CLI as not everyone who'd want to use this would have that installed.
import { DbKey, firestore } from '../../lib/db';
import { createJWT } from '../../lib/jwt';
import withValidate from '../../lib/withValidate';

const dbKeys = firestore.collection<DbKey>({ path: 'dbkeys' });

// eslint-disable-next-line
const handler = async (req: NowRequest, res: NowResponse) => {
  const { key: mnemonic } = req.body as { key: string };
  const [{ content: key }] = await dbKeys.fetchAll();

  if (!(await bcrypt.compare(mnemonic, key)))
    return res.status(400).json({ error: 'Invalid auth key' });

  const token = await createJWT();

  res.setHeader(
    'Set-Cookie',
    cookie.serialize('token', token, { expires: new Date(2147483647000) })
  );
  res.json({ key: token });
};

const schema = Joi.object().keys({ key: Joi.string() });

export default withValidate(schema, handler);
