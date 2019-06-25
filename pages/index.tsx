import ky from 'ky-universal';
import {NextFC} from 'next';
import {useRouter} from 'next/router';
import React from 'react';

import {useForm} from '../lib/hooks';

const Index: NextFC = () => {
    const [ visible, setVisible ] = React.useState(false);
    const [ key, setKey ] = useForm('');
    const [ responseError, setError ] = React.useState<Error | null>(null);
    const router = useRouter();

    const submit = React.useCallback(async () => {
        if (!key) return;

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
    }, [key]);

    React.useEffect(() => setError(null), [key]);

    return visible
        ? <span onClick={() => set(true)}>👀</span>
        : (
            <div>
                <form onSubmit={e => e.preventDefault()}>
                    <input name="authKey" autoComplete="false" value={url} onChange={setUrl}/>
                    <button onClick={submit} disabled={!key}>Submit</button>
                </form>

                {responseError && (
                    <div>
                        Error trying to authenticate
                        <pre><code>{responseError.toString()}</code></pre>
                    </div>
                )}
                <style jsx>
                </style>
            </div>
        );
};

Index.getInitialProps = ({res}) => {

}

export default Index;
