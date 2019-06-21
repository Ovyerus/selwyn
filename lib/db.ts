import mysql from 'serverless-mysql';
import sql from 'sql-template-strings';

const db = mysql({
    config: {
        host: process.env.MYSQL_HOST,
        database: process.env.MYSQL_DATABASE,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD
    }
});

interface OkPacket {}

export interface RedirectRow {
    id: string;
    url: string;
    created_at: Date;
}

export default async function query<T = any>(strings: TemplateStringsArray, ...values: any[]) {
    const res = await db.query<T>(sql(strings, ...values));

    await db.end();
    return res;
}

export const getRedirectById = async (id: string): Promise<RedirectRow | undefined> => (
    await query<RedirectRow[]>`SELECT * FROM redirects WHERE id = ${id} LIMIT 1`
)[0];
export const addRedirect = (id: string, url: string) => query<OkPacket>`INSERT INTO redirects (id, url) VALUES (${id}, ${url})`;
