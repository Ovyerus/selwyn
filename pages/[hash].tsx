import { GetServerSideProps } from "next";
import React from "react";

import { getRedirectByHash } from "./api/redirects/[hash]";

const RedirectPage = () => <div>You shouldn't be here 🤔</div>;

export const getServerSideProps: GetServerSideProps<{}, { hash: string }> =
  async ({ params, res }) => {
    const { hash } = params!;
    const redirect = await getRedirectByHash(hash);

    if (!redirect)
      return {
        notFound: true,
      };
    else {
      res.setHeader("Cache-Control", "max-age=90");
      return {
        redirect: {
          destination: redirect.url,
          statusCode: 301,
        },
      };
    }
  };

export default RedirectPage;
