import plus from "@iconify/icons-gg/math-plus";
import pen from "@iconify/icons-gg/pen";
import trash from "@iconify/icons-gg/trash";
import { Icon } from "@iconify/react";
import cc from "classcat";
import { GetServerSideProps } from "next";
import React, { useState } from "react";
import { useList } from "react-use";

import {
  getDashboardInformation,
  RedirectWithAnalytics,
} from "./api/redirects";

import AddRedirectDialog from "~/components/AddRedirectDialog";
import EditRedirectDialog from "~/components/EditRedirectDialog";
import Toasts from "~/components/Toasts";
import { request } from "~/util";
import * as jwt from "~/util/jwt";
import { useStore } from "~/util/store";

const styles = {
  tableHeadCell:
    "px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wide",
  tableBodyCell: "px-6 py-4 whitespace-nowrap",
} as const;

const StatCard = ({
  subtitle,
  title,
  value,
  valueClassName,
}: StatCardProps) => (
  <div className="flex items-center px-8 py-4 bg-white border-gray-200 rounded-lg shadow">
    <div
      className={cc(["mr-8 text-3xl font-bold text-green-500", valueClassName])}
    >
      {value}
    </div>

    <div className="flex flex-col">
      <span className="-mb-1 text-lg font-semibold leading-snug">{title}</span>
      {!!subtitle && <span className="text-sm text-gray-600">{subtitle}</span>}
    </div>
  </div>
);

interface StatCardProps {
  // className?: string;
  subtitle?: React.ReactNode;
  title: React.ReactNode;
  value: React.ReactNode;
  valueClassName?: string;
}

const DashPage = ({
  redirects: initial,
  lastWeekTotalVisitors,
  lastWeekUniqueVisitors,
}: Props) => {
  const pushToast = useStore(({ pushToast }) => pushToast);

  const [redirects, { push, removeAt, updateAt }] = useList(initial);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialog] = useState(false);

  const [editedId, setEditedId] = useState("");
  const [editedHash, setEditedHash] = useState("");
  const [editedUrl, setEditedUrl] = useState("");

  const startEdit = (redirect: RedirectWithAnalytics) => {
    setEditedId(redirect.hash);
    setEditedHash(redirect.hash);
    setEditedUrl(redirect.url);

    setEditDialog(true);
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

      if (err instanceof Error)
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
    <div className="flex flex-col items-center min-h-screen p-4 sm:p-8 bg">
      <main className="flex flex-col w-full max-w-6xl gap-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Unique visitors"
            subtitle="in the last week"
            value={lastWeekUniqueVisitors}
          />

          <StatCard
            title="Total visitors"
            subtitle="in the last week"
            value={lastWeekTotalVisitors}
          />

          <StatCard
            valueClassName="!text-indigo-500"
            title="Redirects"
            value={redirects.length}
          />
        </div>

        <header className="flex items-center mx-4 dark:text-white">
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

        <div className="overflow-x-auto border-gray-200 shadow overflow-y sm:rounded-lg">
          <table className="min-w-full max-h-full sm:max-h-[500px] divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr className="divide-x divide-gray-200">
                <th className={styles.tableHeadCell}>Path</th>
                <th className={styles.tableHeadCell}>URL</th>
                <th className={styles.tableHeadCell}>Unique Visitors</th>
                <th className={styles.tableHeadCell}>Total Visitors</th>
                <th className={styles.tableHeadCell} />
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {redirects.map((row) => (
                <tr key={row.id} className="hover:bg-indigo-50">
                  <td className={styles.tableBodyCell}>
                    <span
                      className="cursor-pointer"
                      onClick={() => copyHash(row.hash)}
                    >
                      /{row.hash}
                    </span>
                  </td>

                  <td className={styles.tableBodyCell}>
                    {/* TODO: strip protocol? */}
                    <a
                      href={row.url}
                      className="text-indigo-500 hover:underline"
                    >
                      {row.url}
                    </a>
                  </td>

                  <td className={styles.tableBodyCell}>{row.uniqueVisitors}</td>
                  <td className={styles.tableBodyCell}>{row.totalVisitors}</td>

                  <td className={styles.tableBodyCell}>
                    <div className="flex justify-end w-full">
                      <button className="mr-3" onClick={() => startEdit(row)}>
                        <Icon icon={pen} height={24} />
                      </button>

                      <button
                        className="text-red-500"
                        onClick={() => deleteItem(row.hash)}
                      >
                        <Icon icon={trash} height={24} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      <AddRedirectDialog
        pushNewRedirect={push}
        open={addDialogOpen}
        setOpen={setAddDialogOpen}
      />

      <EditRedirectDialog
        editedId={editedId}
        editedHash={editedHash}
        editedUrl={editedUrl}
        open={editDialogOpen}
        updateRedirect={(data) =>
          updateAt(
            redirects.findIndex((r) => r.id === data.id),
            data
          )
        }
        setEditedId={setEditedId}
        setEditedHash={setEditedHash}
        setEditedUrl={setEditedUrl}
        setOpen={setEditDialog}
      />

      <Toasts />
    </div>
  );
};

type PromiseArg<T> = T extends Promise<infer U> ? U : T;
type Props = PromiseArg<ReturnType<typeof getDashboardInformation>>;

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
  const data = await getDashboardInformation(userId);

  return { props: { ...data } };
};

export default DashPage;
