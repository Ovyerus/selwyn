import { User } from "@prisma/client";
import SignJWT from "jose/jwt/sign";
import jwtVerify from "jose/jwt/verify";

// import db from "./db";

const secret = Buffer.from(process.env.JWT_SECRET!);

export const create = (user: User) => {
  const token = new SignJWT({})
    .setSubject(user.id)
    .setAudience("selwyn")
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt();

  return token.sign(secret);
};

export const verify = async (token: string) => {
  try {
    // const { payload } =
    await jwtVerify(token, secret, {
      algorithms: ["HS256"],
      audience: "selwyn",
    });

    return true;
    // const user = await db.user.findUnique({ where: { id: payload.sub } });
    // return user;
  } catch (err) {
    return false;
  }
};
