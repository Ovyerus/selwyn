import { v3 as murmur } from "murmurhash";
import { has, omit } from "rambda";
import { z } from "zod";

interface JsonRequestInit extends RequestInit {
  json?: any;
}

export class StatusError extends Error {
  name = "StatusError";
  res: Response;
  statusCode: number;

  constructor(res: Response) {
    super(`${res.status}: ${res.statusText}`);
    this.statusCode = res.status;
    this.res = res;
  }
}

export const request = <T = any>(
  input: Request | string,
  init?: JsonRequestInit
) => {
  const init_: ResponseInit | undefined =
    init && has("json", init)
      ? {
          ...omit(["json"], init),
          headers: {
            ...init.headers,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(init.json),
        }
      : init;

  return fetch(input, init_).then((res) => {
    if (res.ok) return res.json() as Promise<T>;
    else throw new StatusError(res);
  });
};

export const noExtraWhitespace = (validator: z.ZodString) =>
  validator
    .refine((val) => val.trim() !== "", {
      message: "String cannot be only whitespace",
    })
    .transform((val) => val.trim());

export const hashString = (input: string) => murmur(input).toString(16);
