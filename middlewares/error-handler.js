function errorHandler(errorName, req, res) {
  res.status(500).send({
    success: false,
    errorMessage: errorName
  });
}
