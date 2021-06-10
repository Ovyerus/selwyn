import { lookup } from "geoip-country";

import { IncomingMessage } from "http";

import { hashString } from ".";
import db from "./db";

export const logVisitor = async (req: IncomingMessage, redirect: number) => {
  // TODO: anonymise this if request sets `DNT: 1`?
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

  await db.visitor.create({
    data: {
      hash: hashString(ip),
      country: geoLookup?.country,
      referrer,
      redirect: { connect: { id: redirect } },
    },
  });
};
