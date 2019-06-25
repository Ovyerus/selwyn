import Joi from '@hapi/joi';
import {NowRequest, NowResponse} from '@now/node';

type NowLambda = (req: NowRequest, res: NowResponse) => Promise<any>;

/**
 * HOF for Now handlers to validate the body with a Joi schema.
 */
export default function withValidate(schema: Joi.Schema, handler: NowLambda): NowLambda {
    return async function(req: NowRequest, res: NowResponse) {
        if (!req.body) return res.status(400).json({error: 'Route needs body.'});

        let result: Joi.ValidationResult<any> = Joi.validate(req.body, schema);

        if (result.error) return res.status(400).json(result.error.details);
        else req.body = result.value;

        return handler(req, res);
    }
}
