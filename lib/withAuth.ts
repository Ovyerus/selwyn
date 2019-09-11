import { NowRequest, NowResponse } from '@now/node';

import { compareJWT } from './jwt';

type NowLambda = (req: NowRequest, res: NowResponse) => Promise<any>;

export default function withAuth(handler: NowLambda): NowLambda {
  return async function(req: NowRequest, res: NowResponse) {
    const token = req.cookies.token || (req.headers.authentication as string);

    if (!token) return res.status(401).send(null);

    if (!(await compareJWT(token))) return res.status(401).send(null);
    else return handler(req, res);
  };
}
