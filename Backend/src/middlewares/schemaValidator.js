import schemas from '../validations/schemaValidations.js';

const supportedMethods = ['post', 'put', 'patch', 'delete'];

const validationOptions = {
  abortEarly: false,
  allowUnknown: false,
  stripUnknown: false
};

const schemaValidator = (path, useJoiError = true) => {
  const schema = schemas[path];

  // Check if schema exists for the path
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

    const { error, value } = schema.validate(req.body, validationOptions);

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

    req.body = value;
    return next();
  };
};

export default schemaValidator;
