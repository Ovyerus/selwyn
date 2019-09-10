import cookie from 'cookie';
import { NextPage } from 'next';
import Router from 'next/router';
import React from 'react';

export const withPageNeedsAuth = <P extends object>(
  Component: React.ComponentType<P>,
  invert = false
) => {
  const PageWithAuth: NextPage<P> = props => <Component {...props} />;

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
