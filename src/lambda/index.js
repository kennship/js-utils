function lambda(handler) {
  return (event, context, callback) => {
    handler(event, context)
      .then((response) => {callback(null, response)})
      .catch((error) => {callback(error)});
  }
}

module.exports = lambda;
