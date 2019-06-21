import Joi from '@hapi/joi';
import {NowRequest, NowResponse} from '@now/node';

import u from 'url';

import {addRedirect, getRedirectById} from '../../lib/db';
import hash from '../../lib/hashUrl';
import withValidate from '../../lib/withValidate';

const handler = async (req: NowRequest, res: NowResponse) => {
    const {url, code} = req.body as {url: string; code?: string};
    const id = code || hash(url);

    const exists = await getRedirectById(id);

    if (exists) return res.json(resultFormat(req, exists.id));
    else {
        await addRedirect(id, url);
        res.json(resultFormat(req, id));
    }
}

const resultFormat = (req: NowRequest, id: string) => ({
    url: u.format({
        ...u.parse(`http${(req.connection as any).encrypted ? 's' : ''}://${req.headers.host}`),
        pathname: id
    })
});

const schema = Joi.object().keys({
    url: Joi.string().uri({
        scheme: ['http', 'https']
    }),
    code: Joi.string().regex(/^[a-z0-9-_]{0,32}$/).optional()
});

export default withValidate(schema, handler);
