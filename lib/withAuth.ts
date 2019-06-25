import {NowRequest, NowResponse} from '@now/node';
import bcrypt from 'bcrypt';

import query from './db';

type NowLambda = (req: NowRequest, res: NowResponse) => Promise<any>;

export default function withAuth(handler: NowLambda): NowLambda {
    return async function(req: NowRequest, res: NowResponse) {
        const [ key ] = await query`SELECT key FROM redirect_tokens`;
        const userKey = req.cookies.token || req.headers.authentication as string;

        if (!userKey) return res.status(401).send(null);

        const decoded = Buffer.from(userKey, 'base64').toString();

        if (!await bcrypt.compare(decoded, key)) return res.status(401).send(null);
        else return handler(req, res);
    }
}
