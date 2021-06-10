import plus from "@iconify/icons-gg/math-plus";
import pen from "@iconify/icons-gg/pen";
import trash from "@iconify/icons-gg/trash";
import { Icon } from "@iconify/react";
import cc from "classcat";
import { GetServerSideProps } from "next";
import React, { useState } from "react";
import { useList } from "react-use";

import { getRedirectsForUser, RedirectWithAnalytics } from "./api/redirects";

import styles from "~/assets/style/dash.module.css";
import AddRedirectDialog from "~/components/AddRedirectDialog";
import Toasts from "~/components/Toasts";
import { request } from "~/util";
import * as jwt from "~/util/jwt";
import { useStore } from "~/util/store";

const DashPage = ({ redirects: initial }: Props) => {
  const pushToast = useStore(({ pushToast }) => pushToast);

  const [redirects, { push, removeAt }] = useList(initial);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

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

  const deleteItem = async (hash: string) => {
    try {
      await request(`/api/redirects/${hash}`, { method: "DELETE" });
      removeAt(redirects.findIndex((r) => r.hash === hash));

      pushToast({
        duration: 5000,
        children: (
          <>
            Successfully deleted{" "}
            <code className="bg-black bg-opacity-10 px-1 py-0.5 ml-1 rounded-lg">
              {hash}
            </code>
            .
          </>
        ),
        className: "!bg-green-100 dark:!bg-green-900",
      });
    } catch (err) {
      console.error("failed to delete redirect", err);
      pushToast({
        duration: 5000,
        children: (
          <>
            Failed to create redirect.
            <br />
            {err.message}
          </>
        ),
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
            <button
              className="rounded-button"
              onClick={() => setAddDialogOpen(true)}
            >
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
              <th className={styles.cell}>Total Visitors</th>
              <th className={styles.cell} />
            </tr>
          </thead>

          <tbody className="contents">
            {redirects.map((row) => (
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
                  <span>{row.uniqueVisitors}</span>
                </td>
                <td className={styles.cell}>
                  <span>{row.totalVisitors}</span>
                </td>
                <td className={cc([styles.cell, "justify-end"])}>
                  <button className="mr-3">
                    <Icon icon={pen} height={24} />
                  </button>
                  <button
                    className="text-red-500"
                    onClick={() => deleteItem(row.hash)}
                  >
                    <Icon icon={trash} height={24} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>

      <AddRedirectDialog
        pushNewRedirect={push}
        open={addDialogOpen}
        setOpen={setAddDialogOpen}
      />
    </div>
  );
};

interface Props {
  redirects: RedirectWithAnalytics[];
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
