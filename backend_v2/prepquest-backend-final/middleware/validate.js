const AppError = require('../utils/AppError');

/**
 * Middleware factory for request validation using Joi schemas
 * @param {Object} schema - Joi schema with optional body/query/params keys
 */
const validate = (schema) => (req, res, next) => {
  const validationTargets = {};
  if (schema.body) validationTargets.body = req.body;
  if (schema.query) validationTargets.query = req.query;
  if (schema.params) validationTargets.params = req.params;

  for (const [key, joiSchema] of Object.entries(validationTargets)) {
    const { error, value } = joiSchema.validate(req[key], { abortEarly: false, stripUnknown: true });
    if (error) {
      const message = error.details.map((d) => d.message).join('; ');
      return next(new AppError(`Validation error: ${message}`, 400));
    }
    req[key] = value;
  }

  next();
};

module.exports = validate;
