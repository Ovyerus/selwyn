import React, { FormEvent, useRef, useState } from "react";

import Dialog, { styles as DialogStyles } from "./Dialog";
import Input, { MaskedInput } from "./Input";

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

    if (!val) {
      setNewHash("");
      setNewUrl("");
    }
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
      const toCopy = new URL(location.href);
      toCopy.pathname = `/${data.hash}`;

      pushNewRedirect(data);
      await navigator.clipboard.writeText(toCopy.toString());

      pushToast({
        duration: 3000,
        children: "Done. New redirect copied to clipboard.",
        className: "!bg-green-100 dark:!bg-green-900",
      });

      setOpen(false);
    } catch (err) {
      console.error("failed to create redirect", err);

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
          <Input
            ref={focusRef}
            label="Url"
            note="The url you want to redirect to."
            type="url"
            placeholder="https://google.com"
            value={newUrl}
            required
            onChange={(ev) => setNewUrl(ev.target.value)}
          />
          <MaskedInput
            mask={/^[a-z0-9-]+$/i}
            label="Path"
            note="The path to make the redirect under. Random if not supplied."
            type="text"
            placeholder="my-cool-thing"
            value={newHash}
            prepare={(val: string) => val.replace(/\s/, "-")}
            onChange={(val) => setNewHash(val)}
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
