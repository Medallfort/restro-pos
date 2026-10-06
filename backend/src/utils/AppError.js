// Erreur "attendue" (input ghalet, pas d'acces...): message dyalha kaywsel l client.
// Ay erreur khra kat-rje3 "Internal server error" bla details.
export default class AppError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
