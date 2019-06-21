import Joi from '@hapi/joi';
import {NowRequest, NowResponse} from '@now/node';

type NowLambda = (req: NowRequest, res: NowResponse) => any;

/**
 * HOF for Now handlers to validate the body with a Joi schema.
 */
export default function withValidate(schema: Joi.Schema, handler: NowLambda) {
    return async function(req: NowRequest, res: NowResponse) {
        let result: Joi.ValidationResult<any> | null = null;

        if (req.body) result = Joi.validate(req.body, schema);

        if (result && result.error) return res.status(400).send(result.error.details);
        else if (result) req.body = result.value;

        return handler(req, res);
    }
}
