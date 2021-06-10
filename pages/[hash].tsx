import { GetServerSideProps } from "next";
import React from "react";

import { getRedirectByHash } from "./api/redirects/[hash]";

import { logVisitor } from "~/util/server";

const RedirectPage = () => <div>You shouldn't be here 🤔</div>;

export const getServerSideProps: GetServerSideProps<{}, { hash: string }> =
  async (ctx) => {
    const { hash } = ctx.params!;
    const redirect = await getRedirectByHash(hash);

    if (!redirect)
      return {
        notFound: true,
      };
    else {
      await logVisitor(ctx.req, redirect.id);
      ctx.res.setHeader("Cache-Control", "max-age=30, public");

      return {
        redirect: {
          destination: redirect.url,
          statusCode: 301,
        },
      };
    }
  };

export default RedirectPage;
