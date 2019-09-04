import { NowRequest, NowResponse } from '@now/node';
import bcrypt from 'bcryptjs';
import cookie from 'cookie';
import { NextFC } from 'next';
import Router from 'next/router';
import React from 'react';

import query from './db';

type NowLambda = (req: NowRequest, res: NowResponse) => Promise<any>;

export default function withAuth(handler: NowLambda): NowLambda {
  return async function(req: NowRequest, res: NowResponse) {
    const [{ dbKey: key }] = await query<
      [{ dbKey: string }]
    >`SELECT content AS dbKey FROM redirect_keys`;
    const userKey = req.cookies.token || (req.headers.authentication as string);

    if (!userKey) return res.status(401).send(null);

    const decoded = Buffer.from(userKey, 'base64').toString();

    if (!(await bcrypt.compare(decoded, key)))
      return res.status(401).send(null);
    else return handler(req, res);
  };
}

export const withPageNeedsAuth = <P extends object>(
  Component: React.ComponentType<P>,
  invert: boolean = false
) => {
  const PageWithAuth: NextFC<P> = props => <Component {...props} />;

  // eslint-disable-next-line
  PageWithAuth.getInitialProps = async ({ req, res }) => {
    const path = invert ? '/add' : '/';

    if (req && res) {
      const token =
        req.headers.authorization ||
        (req.headers.cookie ? cookie.parse(req.headers.cookie).token : null);

      if (!token) res.writeHead(302, { Location: path });
    } else {
      const cookies = cookie.parse(document.cookie);

      if (!cookies.token) Router.push(path);
    }

    return {} as P;
  };

  return PageWithAuth;
};
