import schemas from '../validations/schemaValidations.js';

const supportedMethods = ['post', 'put', 'patch', 'delete'];

const validationOptions = {
  abortEarly: false,
  allowUnknown: false,
  stripUnknown: false
};

const schemaValidator = (path = true) => {
  const schema = schemas[path];
  const paramsSchema = schemas[path + '_params'];

  if (!schema && !paramsSchema) {
    console.error(`Schema not found for path: ${path}`);
    throw new Error(`Schema not found for path: ${path}`);
  }

  return (req, res, next) => {
    const method = req.method.toLowerCase();

    if (!supportedMethods.includes(method)) {
      return next();
    }

    if (paramsSchema) {
      console.log('Validating request params:', req.params);
      const { error, value } = paramsSchema.validate(req.params, validationOptions);

      if (error) {
        console.error('Validation error in params:', error.details);
        return res.status(422).json({
          status: 'failed',
          error: 'Invalid request. Please review request and try again.',
          fields: error.details.reduce((acc, curr) => {
            acc[curr.path.join('.')] = curr.message.replace(/['"]/g, '');
            return acc;
          }, {})
        });
      }

      req.params = value;
    }

    if (!paramsSchema && schema) {
      console.log('Validating request body:', req.body);
      const { error, value } = schema.validate(req.body, validationOptions);

      if (error) {
        console.error('Validation error in body:', error.details);
        return res.status(422).json({
          status: 'failed',
          error: 'Invalid request. Please review request and try again.',
          fields: error.details.reduce((acc, curr) => {
            acc[curr.path.join('.')] = curr.message.replace(/['"]/g, '');
            return acc;
          }, {})
        });
      }

      req.body = value;
    }

    return next();
  };
};

export default schemaValidator;
