import { methods, validate } from "avoca";
import cookie from "cookie";
import { z } from "zod";

import { request } from "~/util";
import db from "~/util/db";
import * as jwt from "~/util/jwt";

const querySchema = z.object({
  code: z.string().nonempty(),
});

export default methods({
  get: validate({ querySchema }, async (req, res) => {
    const { code } = req.query;

    const { access_token: ghToken } = await request<{ access_token: string }>(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new URLSearchParams({
          client_id: process.env.GITHUB_CLIENT_ID!,
          client_secret: process.env.GITHUB_CLIENT_SECRET!,
          code,
        }),
      }
    );
    const { email } = await request<{ email: string }>(
      "https://api.github.com/user",
      {
        headers: { Authorization: `token ${ghToken}` },
      }
    );

    const user = await db.user.upsert({
      where: { email },
      create: { email },
      update: {},
    });
    const token = await jwt.create(user);

    res
      .setHeader(
        "Set-Cookie",
        cookie.serialize("token", token, { expires: new Date(2147483647000) })
      )
      .redirect("/dash");
  }),
});
