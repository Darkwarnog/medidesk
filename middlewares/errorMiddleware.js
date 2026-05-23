const errorMiddleware = (err, req, res, next) => {

  console.error(err); // muestra el error en consola

  res.status(500).json({
    error: 'Error interno del servidor'
  });

};

module.exports = errorMiddleware;