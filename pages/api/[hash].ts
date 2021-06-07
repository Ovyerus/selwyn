import { methods, validate } from "avoca";
import { z } from "zod";

import { noExtraWhitespace } from "~/util";
import db from "~/util/db";
import * as jwt from "~/util/jwt";

const getSchema = z.object({
  hash: z.string().nonempty(),
  // TODO: remove this option, force people to do `domain.com/_hash` instead if they want redir.
  redirect: z.boolean().default(true),
});

const patchBodySchema = z.object({
  hash: noExtraWhitespace(z.string().nonempty()).optional(),
  url: noExtraWhitespace(z.string().nonempty().url()).optional(),
});
const hashQuerySchema = z.object({
  hash: z.string().nonempty(),
});

export const getRedirectByHash = (hash: string) =>
  db.redirect.findUnique({ where: { hash } });

export default methods({
  // TODO: add `head` for ETag checks (just generate hash for the redirect's url)?
  get: validate({ querySchema: getSchema }, async (req, res) => {
    const { hash, redirect: doRedir } = req.query;

    const redirect = await getRedirectByHash(hash);
    // TODO: send html or json depending on content type?
    if (!redirect)
      return res.status(404).json({ status: 404, error: "Not Found" });

    if (doRedir)
      res
        // .setHeader("Cache-Control", "max-age=90, must-revalidate")
        .setHeader("Cache-Control", "max-age=90")
        .redirect(301, redirect.url)
        .send(redirect.url);
    else
      res.setHeader("Cache-Control", "max-age=90").json({
        status: 200,
        data: {
          url: redirect.url,
        },
      });
  }),

  patch: {
    authenticate: (req) => jwt.verify(req.cookies.token),
    fn: validate(
      { bodySchema: patchBodySchema, querySchema: hashQuerySchema },
      async (req, res) => {
        const {
          body: { hash: newHash, url: newUrl },
          query: { hash },
        } = req;
        const { sub: userId } = await jwt.getPayload(req.cookies.token);
        const redirect = await db.redirect.findUnique({ where: { hash } });

        if (!redirect)
          return res.status(404).json({ status: 404, message: "Not Found" });

        if (redirect.creatorId !== userId)
          return res
            .status(403)
            .json({ status: 403, message: "You do not own this redirect" });

        if (!newHash && !newUrl)
          return res.status(400).json({
            status: 400,
            message: "Must provide at least one of `hash` or `url`",
          });

        const newRedirect = await db.redirect.update({
          where: { hash },
          data: {
            hash: newHash ?? redirect.hash,
            url: newUrl ?? redirect.url,
          },
        });

        res.json({
          status: 200,
          data: {
            hash: newRedirect.hash,
            url: newRedirect.url,
          },
        });
      }
    ),
  },

  delete: {
    authenticate: (req) => jwt.verify(req.cookies.token),
    fn: validate({ querySchema: hashQuerySchema }, async (req, res) => {
      const { hash } = req.query;
      const { sub: userId } = await jwt.getPayload(req.cookies.token);
      const redirect = await db.redirect.findUnique({ where: { hash } });

      if (!redirect)
        return res.status(404).json({ status: 404, message: "Not Found" });

      if (redirect.creatorId !== userId)
        return res
          .status(403)
          .json({ status: 403, message: "You do not own this redirect" });

      await db.redirect.delete({ where: { hash } });

      res.json({
        status: 200,
        data: { deleted: true },
      });
    }),
  },
});
