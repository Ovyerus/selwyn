import plus from "@iconify/icons-gg/math-plus";
import pen from "@iconify/icons-gg/pen";
import trash from "@iconify/icons-gg/trash";
import { Icon } from "@iconify/react";
import { Redirect } from "@prisma/client";
import cc from "classcat";
import { GetServerSideProps } from "next";
import React from "react";

import { getRedirectsForUser } from "./api/redirects";

import styles from "~/assets/style/dash.module.css";
import Toasts from "~/components/Toasts";
import * as jwt from "~/util/jwt";
import { useStore } from "~/util/store";

const rows = [
  {
    id: "1",
    hash: "google-but-its-actually-super-fucking-epic",
    url: "https://google.com",
    visitors: 0,
  },
  { id: "2", hash: "bing", url: "https://bing.com", visitors: 69 },
  { id: "3", hash: "blog", url: "https://ovyerus.com/blog", visitors: 420 },
  { id: "4", hash: "43f78c02", url: "https://github.com", visitors: -1 },
  { id: "5", hash: "google", url: "https://google.com", visitors: 0 },
  { id: "6", hash: "google", url: "https://google.com", visitors: 0 },
  { id: "7", hash: "google", url: "https://google.com", visitors: 0 },
  { id: "8", hash: "google", url: "https://google.com", visitors: 0 },
  { id: "9", hash: "google", url: "https://google.com", visitors: 0 },
  { id: "10", hash: "google", url: "https://google.com", visitors: 0 },
  { id: "11", hash: "google", url: "https://google.com", visitors: 0 },
];

const DashPage = ({ redirects }: Props) => {
  const pushToast = useStore(({ pushToast }) => pushToast);

  const copyHash = async (hash: string) => {
    const toCopy = new URL(location.href);
    toCopy.pathname = `/${hash}`;

    try {
      await navigator.clipboard.writeText(toCopy.toString());
      pushToast({
        duration: 3000,
        children: "Copied to clipboard.",
        className: "!bg-green-100 dark:!bg-green-900",
      });
    } catch (err) {
      console.error("failed to write to clipboard", err);
      pushToast({
        duration: 5000,
        children: "Failed to copy to clipboard.",
        className: "!bg-red-100 dark:!bg-red-900",
      });
    }
  };

  // TODO: graphs?
  return (
    <div className="p-2 flex items-center justify-center min-h-screen bg">
      <Toasts />

      <main className="max-w-6xl w-full flex flex-col">
        <header className="m-4 mt-2 flex items-center sm:mt-0 dark:text-white">
          <div>
            <span className="font-bold">{redirects.length}</span> redirects
          </div>

          <div className="flex-grow" />

          <div className="flex items-center justify-end">
            <button className="rounded-button">
              <Icon icon={plus} height={24} />
            </button>
          </div>
        </header>

        <table className={styles.table}>
          <thead className="contents">
            {/* TODO: clicking on `th` to sort by column */}
            <tr className={styles.row}>
              <th className={styles.cell}>Path</th>
              <th className={styles.cell}>URL</th>
              <th className={styles.cell}>Unique Visitors</th>
              <th className={styles.cell} />
            </tr>
          </thead>

          <tbody className="contents">
            {rows.map((row) => (
              <tr key={row.id} className={styles.row}>
                <td className={styles.cell}>
                  <span
                    className="cursor-pointer"
                    onClick={() => copyHash(row.hash)}
                  >
                    /{row.hash}
                  </span>
                </td>
                <td className={styles.cell}>
                  <a
                    className="block w-full break-words text-indigo-500 hover:underline"
                    href={row.url}
                  >
                    {/* TODO: strip protocol? */}
                    {row.url}
                  </a>
                </td>
                <td className={styles.cell}>
                  <span>{row.visitors}</span>
                </td>
                <td className={cc([styles.cell, "justify-end"])}>
                  <button className="mr-3">
                    <Icon icon={pen} height={24} />
                  </button>
                  <button className="text-red-500">
                    <Icon icon={trash} height={24} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
};

interface Props {
  redirects: Redirect[];
}

export const getServerSideProps: GetServerSideProps<Props> = async ({
  req,
}) => {
  const isAuthed = await jwt.verify(req.cookies.token);

  if (!isAuthed)
    return {
      redirect: {
        destination: "/login",
        statusCode: 307,
      },
    };

  const { sub: userId } = await jwt.getPayload(req.cookies.token);
  const redirects = await getRedirectsForUser(userId);

  return { props: { redirects } };
};

export default DashPage;
