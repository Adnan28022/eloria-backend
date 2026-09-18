const successResponse = (data, message = 'Success') => ({
  success: true,
  message,
  data,
});

const errorResponse = (error, message = 'Error') => ({
  success: false,
  message,
  error,
});

module.exports = { successResponse, errorResponse };
