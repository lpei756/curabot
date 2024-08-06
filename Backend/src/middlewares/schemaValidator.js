import schemas from '../validations/schemaValidations.js';

const supportedMethods = ['post', 'put', 'patch', 'delete', 'get'];
const validationOptions = {
    abortEarly: false,
    allowUnknown: true,
    stripUnknown: true 
};

const schemaValidator = (path, useJoiError = true) => {
    const schema = schemas[path];

    if (!schema) {
        console.log(`Requested path: ${path}`);
        console.log(`Available schemas: ${Object.keys(schemas)}`);
        throw new Error(`Schema not found for path: ${path}`);
    }

    return (req, res, next) => {
        const method = req.method.toLowerCase();

        if (!supportedMethods.includes(method)) {
            return next();
        }

        let source;
        if (method === 'get') {
            source = req.params;
        } else {
            source = req.body;
        }

        const { error, value } = schema.validate(source, validationOptions);

        if (error) {
            const unifiedError = {
                status: 'failed',
                error: 'Invalid request. Please review request and try again.',
                fields: {}
            };

            if (useJoiError && error.details) {
                error.details.forEach(({ message, path }) => {
                    const fieldName = path.join('.');
                    unifiedError.fields[fieldName] = message.replace(/['"]/g, '');
                });
            }

            return res.status(422).json(unifiedError);
        }

        if (method === 'get') {
            req.params = value;
        } else {
            req.body = value;
        }

        return next();
    };
};

export default schemaValidator;