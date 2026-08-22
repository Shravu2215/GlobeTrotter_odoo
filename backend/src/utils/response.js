function sendSuccess(res, data, message = "Success", statusCode = 200) {
  return res.status(statusCode).json({ success: true, message, data });
}

function sendError(res, message = "Error", statusCode = 400, errors = null) {
  const body = { success: false, message };
  if (errors) body.errors = errors;
  return res.status(statusCode).json(body);
}

module.exports = { sendSuccess, sendError };
