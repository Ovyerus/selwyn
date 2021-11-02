import { Redirect } from "@prisma/client";
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

export type RedirectWithAnalytics = Omit<
  Redirect,
  "createdAt" | "updatedAt"
> & {
  createdAt: string;
  updatedAt: string;
  uniqueVisitors: number;
  totalVisitors: number;
};

export interface CountRow {
  count: number;
}

export const getDashboardInformation = async (creatorId: string) => {
  // TODO: configurable timeframes
  // TODO: best referrals, countries, etc.
  // Comparison with timeframe before
  const redirectsWithAnalytics = db.$queryRaw<RedirectWithAnalytics[]>`
  SELECT
    r.*,
    COUNT(DISTINCT v.hash) AS "uniqueVisitors",
    COUNT(v) AS "totalVisitors"
  FROM "Redirect" AS r
  LEFT JOIN "Visitor" AS v ON v."redirectId" = r.id
  WHERE r."creatorId" = ${creatorId}
  GROUP BY r.id;
  `;

  const lastWeekUniqueVisitorsQuery = db.$queryRaw<[CountRow]>`
  SELECT COUNT(sub.*)
  FROM (
    SELECT
      DISTINCT ON (v.hash) hash
    FROM "Visitor" as v
    WHERE v."createdAt" > NOW() - INTERVAL '7 days'
  ) AS sub;
  `;

  // TODO: returning visitors instead?
  const lastWeekTotalVisitorsQuery = db.$queryRaw<[CountRow]>`
  SELECT
    COUNT (v.*)
  FROM "Visitor" as v
  WHERE v."createdAt" > NOW() - INTERVAL '7 days';
  `;

  const [
    redirects,
    [{ count: lastWeekUniqueVisitors }],
    [{ count: lastWeekTotalVisitors }],
  ] = await db.$transaction([
    redirectsWithAnalytics,
    lastWeekUniqueVisitorsQuery,
    lastWeekTotalVisitorsQuery,
  ]);

  return { redirects, lastWeekUniqueVisitors, lastWeekTotalVisitors };
};

export default methods({
  get: {
    authenticate: (req) => jwt.verify(req.cookies.token),
    // TODO: option for showing all & who made what
    async fn(req, res) {
      const { sub: userId } = await jwt.getPayload(req.cookies.token);
      // TODO: pagination
      const data = getDashboardInformation(userId);

      res.json({ status: 200, data });
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
        data: { ...redirect, uniqueVisitors: 0, totalVisitors: 0 },
      });
    }),
  },
});
