import { JWK, JWT } from '@panva/jose';

import { DbKey, firestore } from './db';

const dbKeys = firestore.collection<DbKey>({ path: '/dbkeys' });

export async function createJWT() {
  const [{ content }] = await dbKeys.fetchAll();
  const key = JWK.asKey(content);

  return JWT.sign({ authenticated: true }, key, {
    issuer: 'micro-link'
  });
}

export async function compareJWT(token: string): Promise<boolean> {
  const [{ content }] = await dbKeys.fetchAll();
  const key = JWK.asKey(content);

  try {
    return !!JWT.verify(token, key, {
      issuer: 'micro-link'
    });
  } catch (err) {
    if (
      err.code === 'ERR_JWS_VERIFICATION_FAILED' ||
      err.code === 'ERR_JWT_MALFORMED'
    )
      return false;
    else throw err;
  }
}
