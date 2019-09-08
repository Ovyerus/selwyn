import admin, { ServiceAccount } from 'firebase-admin';
import { FirestoreSimple } from 'firestore-simple';

export interface Redirect {
  id: string;
  url: string;
  created: Date;
}

export interface DbKey {
  id: string;
  content: string;
}

function getConfig(): ServiceAccount {
  // Env var injected by the Now + GCloud integration
  return process.env.GCLOUD_CREDENTIALS
    ? JSON.parse(
        // XXX: JSON.parse in Node actually allows a Buffer input but types say no.
        // Should make PR to types to add that.
        Buffer.from(process.env.GCLOUD_CREDENTIALS, 'base64').toString('utf-8')
      )
    : require('../firebase.json'); // eslint-disable-line
}
const config = getConfig();

admin.initializeApp({ credential: admin.credential.cert(config) });

const baseFirestore = admin.firestore();
export const firestore = new FirestoreSimple(baseFirestore);
const redirects = firestore.collection<Redirect>({
  path: 'redirects',
  decode: ({ id, url, created }) => ({ id, url, created: created.toDate() })
});

export const getRedirectById = (id: string) => redirects.fetch(id);
export const addRedirect = (id: string, url: string) =>
  redirects.add({
    id,
    url,
    created: admin.firestore.FieldValue.serverTimestamp()
  });
