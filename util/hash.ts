import { randomBytesSeed } from "@csquare/random-bytes-seed";
import { format } from "date-fns";

import crypto from "crypto";
import { IncomingMessage } from "http";

const getDailySalt = () =>
  randomBytesSeed(16, format(new Date(), "yyyyMMdd")).toString("hex");

export const hashRequest = (req: IncomingMessage) => {
  const hash = crypto.createHash("sha256").update(getDailySalt());
  const ip =
    (req.headers["x-forwarded-for"] as string | undefined)
      ?.split(",")
      .shift() ||
    req.socket.remoteAddress ||
    "";

  return hash
    .update(ip)
    .update(req.headers["user-agent"] || "")
    .digest()
    .toString("hex");
};
