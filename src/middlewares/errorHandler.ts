import { ErrorRequestHandler } from "express";
import * as Yup from "yup";
import AppError from "../errors/AppError";

const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  // Erros esperados da aplicação
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      message: error.message,
    });
    return;
  }

  // Erros de validação do Yup
  if (error instanceof Yup.ValidationError) {
    const errors = error.inner.length > 0 ? error.inner : [error];

    res.status(400).json({
      message: "Dados inválidos.",
      errors: errors.map((item) => ({
        field: item.path ?? "body",
        message: item.message,
      })),
    });
    return;
  }

  // Erros inesperados
  console.error(error);

  res.status(500).json({
    message: "Erro interno do servidor.",
  });
};

export default errorHandler;
