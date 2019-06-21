import {NowRequest, NowResponse} from '@now/node';

import {getRedirectById} from '../../lib/db';

export default async (req: NowRequest, res: NowResponse) => {
    const {id} = req.query as {id: string};

    if (!id) return res.status(400).send('ID needed');

    const redirect = await getRedirectById(id);

    if (!redirect) return res.status(404).send('Not found');
    else {
        res.writeHead(301, { Location: redirect.url });
        res.end();
    }
}
