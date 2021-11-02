import React, { FormEvent, useRef, useState } from "react";

import Dialog, { styles as DialogStyles } from "./Dialog";
import Input, { MaskedInput } from "./Input";

import { RedirectWithAnalytics } from "~/pages/api/redirects";
import { request } from "~/util";
import { useStore } from "~/util/store";

const EditRedirectDialog = ({
  updateRedirect,
  editedId,
  editedHash,
  editedUrl,
  open,
  setEditedId,
  setEditedHash,
  setEditedUrl,
  setOpen: _setOpen,
}: AddRedirectDialogProps) => {
  const pushToast = useStore(({ pushToast }) => pushToast);
  const focusRef = useRef(null);

  const [loading, setLoading] = useState(false);

  const setOpen = (val: boolean) => {
    _setOpen(val);

    if (!val) {
      setEditedId("");
      setEditedHash("");
      setEditedUrl("");
    }
  };

  const submit = async (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    setLoading(true);

    try {
      // TODO: update endpoint to also get new visitors
      const { data } = await request<{ data: RedirectWithAnalytics }>(
        `/api/redirects/${editedId}`,
        {
          method: "PATCH",
          json: {
            url: editedUrl || undefined,
            hash: editedHash || undefined,
          },
        }
      );
      const toCopy = new URL(location.href);
      toCopy.pathname = `/${data.hash}`;

      updateRedirect(data);
      await navigator.clipboard.writeText(toCopy.toString());

      pushToast({
        duration: 3000,
        children: "Done. Updated redirect copied to clipboard.",
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
      title="Update Redirect"
      description="Change information about an existing redirect."
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
            value={editedUrl}
            onChange={(ev) => setEditedUrl(ev.target.value)}
          />
          <MaskedInput
            mask={/^[a-z0-9-]+$/i}
            label="Path"
            note="The path to make the redirect under. Random if not supplied."
            type="text"
            placeholder="my-cool-thing"
            value={editedHash}
            prepare={(val: string) => val.replace(/\s/, "-")}
            onChange={(val) => setEditedHash(val)}
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
            disabled={!editedHash && !editedHash}
            onClick={() => void 0}
          >
            Update
          </button>

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
  editedId: string;
  editedHash: string;
  editedUrl: string;
  open: boolean;
  setEditedId(val: string): void;
  setEditedHash(val: string): void;
  setEditedUrl(val: string): void;
  updateRedirect(data: RedirectWithAnalytics): void;
  setOpen(value: boolean): void;
}

export default EditRedirectDialog;
