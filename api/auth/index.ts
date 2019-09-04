import Joi from '@hapi/joi';
import { NowRequest, NowResponse } from '@now/node';
import bcrypt from 'bcryptjs';
import cookie from 'cookie';

import query from '../../lib/db';
import withValidate from '../../lib/withValidate';

// eslint-disable-next-line
const handler = async (req: NowRequest, res: NowResponse) => {
  const { key } = req.body as { key: string };
  // TODO: do we need to throw error if doesn't exist.
  const [{ dbKey }] = await query<
    [{ dbKey: string }]
  >`SELECT content AS dbKey FROM redirect_keys`;

  if (!(await bcrypt.compare(key, dbKey)))
    return res.status(400).json({
      error: 'Invalid auth key'
    });

  const encodedKey = Buffer.from(key).toString('base64');

  res.setHeader(
    'Set-Cookie',
    cookie.serialize('token', encodedKey, { expires: new Date(2147483647000) })
  );
  res.json({ key: encodedKey });
};

const schema = Joi.object().keys({ key: Joi.string() });

export default withValidate(schema, handler);
