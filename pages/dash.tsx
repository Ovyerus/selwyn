import { Dialog } from "@headlessui/react";
import plus from "@iconify/icons-gg/math-plus";
import pen from "@iconify/icons-gg/pen";
import trash from "@iconify/icons-gg/trash";
import { Icon } from "@iconify/react";
import { Redirect } from "@prisma/client";
import cc from "classcat";
import { AnimatePresence, motion } from "framer-motion";
import { GetServerSideProps } from "next";
import React, { FormEvent, useRef, useState } from "react";
import { useList } from "react-use";

import { getRedirectsForUser } from "./api/redirects";

import styles from "~/assets/style/dash.module.css";
import Toasts from "~/components/Toasts";
import { request } from "~/util";
import * as jwt from "~/util/jwt";
import { useStore } from "~/util/store";

const DashPage = ({ redirects: initial }: Props) => {
  const pushToast = useStore(({ pushToast }) => pushToast);
  const dialogFocus = useRef(null);

  const [redirects, { push }] = useList(initial);
  const [dialogOpen, _setDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newHash, setNewHash] = useState("");
  const [newUrl, setNewUrl] = useState("");

  const setDialog = (val: boolean) => {
    _setDialog(val);
    setNewHash("");
    setNewUrl("");
  };

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

  const submit = async (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    setLoading(true);

    try {
      const { data } = await request<{ data: Redirect }>("/api/redirects", {
        method: "POST",
        json: {
          url: newUrl,
          hash: newHash || undefined,
        },
      });

      // TODO: deserialise createdAt and updatedAt into Dates, if we need them later.
      push(data);
      pushToast({
        duration: 3000,
        children: "Done!",
      });
      setDialog(false);
    } catch (err) {
      console.error("failed to create redirect", err);
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
    } finally {
      setLoading(false);
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
            <button className="rounded-button" onClick={() => setDialog(true)}>
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
                  {/* <span>{row.visitors}</span> */}
                  <span>0</span>
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

      <AnimatePresence>
        {dialogOpen && (
          <Dialog
            className="fixed z-10 inset-0 overflow-y-auto"
            initialFocus={dialogFocus}
            open={dialogOpen}
            static
            onClose={() => setDialog(false)}
          >
            <div className="flex items-center justify-center min-h-screen">
              <Dialog.Overlay
                as={motion.div}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                transition={{
                  type: "spring",
                  mass: 0.1,
                  damping: 10,
                  stiffness: 150,
                }}
                className="fixed inset-0 bg-black"
              />

              <motion.aside
                className="p-4 mx-auto max-w-md w-full bg-white dark:bg-gray-900 dark:text-white rounded-2xl z-20 shadow-2xl overflow-hidden"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{
                  type: "spring",
                  mass: 0.1,
                  damping: 10,
                  stiffness: 150,
                  velocity: 10,
                }}
              >
                <header>
                  <Dialog.Title className="font-bold text-2xl">
                    New redirect
                  </Dialog.Title>
                  <Dialog.Description className="font-medium text-sm">
                    Create a new redirect
                  </Dialog.Description>
                </header>

                <form className="contents" onSubmit={submit}>
                  <div className="my-4 flex flex-col gap-2">
                    <input
                      ref={dialogFocus}
                      className="input"
                      type="url"
                      placeholder="https://google.com"
                      value={newUrl}
                      required
                      onChange={(ev) => setNewUrl(ev.target.value)}
                    />
                    {/* TODO: additional constraints on needing to be URL-safe/force sluggify (field mask) */}
                    <input
                      className="input"
                      type="text"
                      placeholder="Path (optional)"
                      value={newHash}
                      onChange={(ev) => setNewHash(ev.target.value)}
                    />
                  </div>

                  <footer className="flex w-full items-center justify-end gap-2">
                    <button
                      className="button"
                      type="button"
                      onClick={() => setDialog(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="button success"
                      type="submit"
                      disabled={!newUrl}
                      onClick={() => void 0}
                    >
                      Create
                    </button>

                    {/* TODO: Make buttons a component and put these into them as a prop? */}
                    {loading && (
                      <div role="status" className="spinner">
                        <div className="sr-only">Loading...</div>
                      </div>
                    )}
                  </footer>
                </form>
              </motion.aside>
            </div>
          </Dialog>
        )}
      </AnimatePresence>
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
