// Wrap any Zod schema: validate(schema) as route middleware
function validate(schema) {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      next(err); // caught by errorHandler's ZodError branch
    }
  };
}

module.exports = validate;
