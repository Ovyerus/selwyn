import ky from 'ky-universal';
import { repeat } from 'rambda';
import React from 'react';
import MaskedInput from 'react-text-mask';

import { useForm } from '../lib/hooks';
import { withPageNeedsAuth } from '../lib/pages';

interface APIResponse {
  url: string;
}

const Add: React.FC = () => {
  const [url, setUrl] = useForm('');
  const [code, setCode] = useForm('');
  const [result, setResult] = React.useState<string | null>(null);
  const [responseError, setError] = React.useState<Error | null>(null);
  const mask = React.useMemo(() => repeat(/[a-z0-9-_)]/, 32), []);

  const badUrl = React.useMemo(() => {
    if (!url) return false;

    try {
      return !new URL(url);
    } catch {
      return true;
    }
  }, [url]);
  const submit = React.useCallback(async () => {
    if (badUrl) return;

    setResult(null);
    setError(null);

    let result: APIResponse;

    try {
      result = await ky
        .post('shorten', {
          prefixUrl: location.origin,
          json: { url, code }
        })
        .json<APIResponse>();
    } catch (err) {
      const b = await err.response.json();

      console.log(b);
      console.error(err);
      setError(err);
      return;
    }

    setResult(result.url);
  }, [badUrl, code, url]);
  const copyToClipboard = React.useCallback(async () => {
    if (!result) return;

    if (!navigator.clipboard) {
      const textArea = document.createElement('textarea');
      textArea.value = result;

      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        document.execCommand('copy');
        console.log('tried using fallback');
      } catch {
        /**/
      }
      return;
    }

    await navigator.clipboard.writeText(result);
    console.log('Copied result to clipboard');
  }, [result]);

  React.useEffect(() => setError(null), [url]);

  return (
    <div className="container">
      <h2>Enter url to shorten</h2>
      <form onSubmit={e => e.preventDefault()}>
        <div className="input-wrapper">
          <input
            name="shortenUrl"
            autoComplete="false"
            value={url}
            onChange={setUrl}
          />
          {badUrl && <div>Invalid url. Make sure it's a full url</div>}
        </div>

        <div className="input-wrapper">
          <MaskedInput
            name="customCode"
            guide={false}
            mask={mask}
            value={code}
            onChange={setCode}
          />
        </div>

        <button disabled={badUrl || !url} onClick={submit}>
          Submit
        </button>
      </form>

      {responseError && (
        <div>
          Error trying to submit url <code>{url}</code>
          <pre>
            <code>{responseError.toString()}</code>
          </pre>
        </div>
      )}

      {result && (
        <div>
          Shortened url:{' '}
          <code title="Copy to clipboard" onClick={copyToClipboard}>
            {result}
          </code>
        </div>
      )}
      <style jsx>{`
        .container {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }
      `}</style>
    </div>
  );
};

export default withPageNeedsAuth(Add);
