import React, { FormEvent, useRef, useState } from "react";

import Dialog, { styles as DialogStyles } from "./Dialog";

import { RedirectWithAnalytics } from "~/pages/api/redirects";
import { request } from "~/util";
import { useStore } from "~/util/store";

const AddRedirectDialog = ({
  pushNewRedirect,
  open,
  setOpen: _setOpen,
}: AddRedirectDialogProps) => {
  const pushToast = useStore(({ pushToast }) => pushToast);
  const focusRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [newHash, setNewHash] = useState("");
  const [newUrl, setNewUrl] = useState("");

  const setOpen = (val: boolean) => {
    _setOpen(val);
    setNewHash("");
    setNewUrl("");
  };

  const submit = async (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    setLoading(true);

    try {
      const { data } = await request<{ data: RedirectWithAnalytics }>(
        "/api/redirects",
        {
          method: "POST",
          json: {
            url: newUrl,
            hash: newHash || undefined,
          },
        }
      );

      // TODO: deserialise createdAt and updatedAt into Dates, if we need them later.
      pushNewRedirect(data);
      // Copy to clipboard?
      pushToast({
        duration: 3000,
        children: "Done!",
        className: "!bg-green-100 dark:!bg-green-900",
      });
      setOpen(false);
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

  return (
    <Dialog
      title="New Redirect"
      description="Create a new redirect."
      open={open}
      focusRef={focusRef}
      onClose={setOpen}
    >
      <form className="contents" onSubmit={submit}>
        <div className={DialogStyles.inputs}>
          <input
            ref={focusRef}
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

        <footer className={DialogStyles.footer}>
          <button
            className="button"
            type="button"
            onClick={() => setOpen(false)}
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
    </Dialog>
  );
};

export interface AddRedirectDialogProps {
  pushNewRedirect(data: RedirectWithAnalytics): void;
  open: boolean;
  setOpen(value: boolean): void;
}

export default AddRedirectDialog;
