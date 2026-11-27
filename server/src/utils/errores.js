// Error con código HTTP y mensaje pensado para mostrarse en la app.
class ErrorApi extends Error {
  constructor(estado, mensaje, detalles) {
    super(mensaje);
    this.estado = estado;
    this.detalles = detalles;
  }
}

const noEncontrado = (que) => new ErrorApi(404, `${que} no existe o no te pertenece.`);
const solicitudInvalida = (mensaje, detalles) => new ErrorApi(400, mensaje, detalles);

module.exports = { ErrorApi, noEncontrado, solicitudInvalida };
