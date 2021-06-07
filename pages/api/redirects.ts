import { methods, validate } from "avoca";
import { z } from "zod";

import { hashString, noExtraWhitespace } from "~/util";
import db from "~/util/db";
import * as jwt from "~/util/jwt";

// const getSchema = z.object({
//   all: z.boolean().default(false),
// });

const postSchema = z.object({
  url: noExtraWhitespace(z.string().nonempty().url()),
  hash: noExtraWhitespace(z.string().nonempty()).optional(), // Will have hash generated if not provided.
});

export const getRedirectsForUser = (creatorId: string) =>
  db.redirect.findMany({
    where: { creatorId },
    take: 100,
  });

export default methods({
  get: {
    authenticate: (req) => jwt.verify(req.cookies.token),
    // TODO: option for showing all & who made what
    async fn(req, res) {
      const { sub: userId } = await jwt.getPayload(req.cookies.token);
      // TODO: pagination
      const redirects = getRedirectsForUser(userId);

      res.json({ status: 200, data: redirects });
    },
  },

  post: {
    authenticate: (req) => jwt.verify(req.cookies.token),
    fn: validate({ bodySchema: postSchema }, async (req, res) => {
      const { hash: hash_, url } = req.body;
      const { sub: userId } = await jwt.getPayload(req.cookies.token);
      const existingRedirect = await db.redirect.findFirst({
        where: { hash: hash_ },
      });

      if (hash_ && existingRedirect)
        return res.status(409).json({
          status: 409,
          message: "Redirect with `hash` already exists.",
        });

      // Add current time to url to ensure we don't conflict if it's been previously added
      const hash = hash_ ?? hashString(url + new Date().toISOString());
      const redirect = await db.redirect.create({
        data: {
          hash,
          url,
          creator: { connect: { id: userId } },
        },
      });

      res.json({
        status: 200,
        data: redirect,
      });
    }),
  },
});
