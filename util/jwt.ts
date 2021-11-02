import { User } from "@prisma/client";
import { SignJWT, jwtVerify } from "jose";

import db from "./db";

interface Payload {
  sub: string;
  aud: string;
  iat: number;
}

const secret = Buffer.from(process.env.JWT_SECRET!);
const verifyOptions = {
  algorithms: ["HS256"],
  audience: "selwyn",
};

/** Create a new JWT for a user. */
export const create = (user: User) => {
  const token = new SignJWT({})
    .setSubject(user.id)
    .setAudience("selwyn")
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt();

  return token.sign(secret);
};

/** Verify a given JWT. */
export const verify = async (token: string) => {
  try {
    const { payload } = await jwtVerify(token, secret, verifyOptions);

    const user = await db.user.findUnique({ where: { id: payload.sub } });
    return !!user?.isAdmin;
  } catch (err) {
    return false;
  }
};

/** Get the payload from a JWT */
export const getPayload = (token: string) =>
  jwtVerify(token, secret, verifyOptions).then(
    ({ payload }) => payload as Payload
  );
