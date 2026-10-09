import { RequestHandler } from "express";
import * as Yup from "yup";

export const validateBody = (schema: Yup.AnyObjectSchema): RequestHandler => {
  return async (req, _res, next) => {
    try {
      req.body = await schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: false,
      });

      next();
    } catch (error) {
      next(error);
    }
  };
};
