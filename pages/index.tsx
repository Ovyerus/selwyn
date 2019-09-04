import ky from 'ky-universal';
import { useRouter } from 'next/router';
import React from 'react';

import { useForm } from '../lib/hooks';
import { withPageNeedsAuth } from '../lib/withAuth';

const Index: React.FC = () => {
  const [visible, setVisible] = React.useState(false);
  const [key, setKey] = useForm('');
  const [responseError, setError] = React.useState<Error | null>(null);
  const router = useRouter();

  const submit = React.useCallback(async () => {
    if (!key) return;

    setError(null);

    try {
      await ky.post('auth', {
        prefixUrl: location.origin,
        json: { key }
      });
      router.push('/add');
    } catch (err) {
      console.error(err);
      setError(err);
    }
  }, [key, router]);

  React.useEffect(() => setError(null), [key]);

  return !visible ? (
    <span onClick={() => setVisible(true)}>👀</span>
  ) : (
    <div className="container">
      <form onSubmit={e => e.preventDefault()}>
        <input
          name="authKey"
          autoComplete="false"
          value={key}
          onChange={setKey}
        />
        <button disabled={!key} onClick={submit}>
          Submit
        </button>
      </form>

      {responseError && (
        <div>
          Error trying to authenticate
          <pre>
            <code>{responseError.toString()}</code>
          </pre>
        </div>
      )}
      <style jsx>{`
        .container {
        }
      `}</style>
    </div>
  );
};

export default withPageNeedsAuth(Index, true);
