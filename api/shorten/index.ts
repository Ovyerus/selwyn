import Joi from '@hapi/joi';
import {NowRequest, NowResponse} from '@now/node';

import u from 'url';

import {addRedirect, getRedirectById} from '../../lib/db';
import hash from '../../lib/hashUrl';
import withValidate from '../../lib/withValidate';

const handler = async (req: NowRequest, res: NowResponse) => {
    const {url} = req.body as {url: string};
    const id = hash(url);

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
    })
});

export default withValidate(schema, handler);
