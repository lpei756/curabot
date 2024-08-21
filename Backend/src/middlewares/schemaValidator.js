import schemas from '../validations/schemaValidations.js';

const supportedMethods = ['post', 'put', 'patch', 'delete'];

const validationOptions = {
  abortEarly: false,
  allowUnknown: false,
  stripUnknown: false
};

const schemaValidator = (path, useJoiError = true) => {
  console.log(`Initializing schemaValidator for path: ${path}`);
  const schema = schemas[path];
  // 在这里添加调试代码
  console.log(`Path: ${path}`);
  console.log(`Schema for ${path}:`);


  if (!schema) {
    console.error(`Schema not found for path: ${path}`);
    throw new Error(`Schema not found for path: ${path}`);
  }

  return (req, res, next) => {
    const method = req.method.toLowerCase();
    console.log(`Handling request for path: ${path}, method: ${method}`);

    if (!supportedMethods.includes(method)) {
      console.log(`Method ${method} is not supported for validation. Skipping validation.`);
      return next();
    }

    console.log(`Validating request body:`, req.body);
    const { error, value } = schema.validate(req.body, validationOptions);

    if (error) {
      console.error('Validation error:', error.details);
      const unifiedError = {
        status: 'failed',
        error: 'Invalid request. Please review request and try again.',
        fields: {}
      };

      if (useJoiError && error.details) {
        error.details.forEach(({ message, path }) => {
          const fieldName = path.join('.');
          unifiedError.fields[fieldName] = message.replace(/['"]/g, '');
          console.log(`Validation error in field ${fieldName}: ${unifiedError.fields[fieldName]}`);
        });
      }

      return res.status(422).json(unifiedError);
    }

    console.log('Validation successful. Processed request body:', value);
    req.body = value;
    return next();
  };
};

export default schemaValidator;
