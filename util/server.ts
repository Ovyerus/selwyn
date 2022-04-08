import { lookup } from "geoip-country";

import { IncomingMessage } from "http";

import db from "./db";
import { hashRequest } from "./hash";

export const logVisitor = async (req: IncomingMessage, redirect: number) => {
  const ip =
    (req.headers["x-forwarded-for"] as string | undefined)
      ?.split(",")
      .shift() || req.socket.remoteAddress;
  const geoLookup = lookup(ip!);
  const referrer = req.headers.referer
    ? new URL(req.headers.referer).origin
    : null;

  // In case we can't get it for whatever reason.
  if (!ip) return;
  const hash = hashRequest(req);

  await db.visitor.create({
    data: {
      hash,
      country: geoLookup?.country,
      referrer,
      redirect: { connect: { id: redirect } },
    },
  });
};
