import schemas from '../validations/schemaValidations.js';

// Supported HTTP methods for validation
const supportedMethods = ['post','get', 'put', 'patch', 'delete'];

// Joi validation options
const validationOptions = {
  abortEarly: false,
  allowUnknown: false,
  stripUnknown: false
};

// Middleware to validate request body against Joi schema
const schemaValidator = (path, useJoiError = true) => {
  const schema = schemas[path]; // Get schema for the path

  // Check if schema exists for the path
  if (!schema) {
    throw new Error(`Schema not found for path: ${path}`);
  }

  // Return middleware function
  return (req, res, next) => {
    const method = req.method.toLowerCase();

    // Check if method is supported
    if (!supportedMethods.includes(method)) {
      return next();
    }

    // Determine the source of validation based on the method
    const source = method === 'get' ? req.params : req.body;

    // Validate request against schema
    const { error, value } = schema.validate(source, validationOptions);

    if (error) {
      // Refactored error handling to always use a unified error format
      const unifiedError = {
        status: 'failed',
        error: 'Invalid request. Please review request and try again.',
        fields: {}
      };

      if (useJoiError && error.details) {
        // Process Joi error details for field-specific messages
        error.details.forEach(({ message, path }) => {
          const fieldName = path.join('.'); // Convert array path to dot notation
          unifiedError.fields[fieldName] = message.replace(/['"]/g, ''); // Clean message
        });
      } else {
        // For custom errors, you could optionally add a general message to `fields`
        // unifiedError.fields.general = unifiedError.error;
      }

      return res.status(422).json(unifiedError);
    }

    // validation
    if (method === 'get') {
      req.params = value;
    } else {
      req.body = value;
    }

    return next();
  };
};

export default schemaValidator;
