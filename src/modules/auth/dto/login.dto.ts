import * as yup from "yup";

export const loginDto = yup
  .object({
    email: yup
      .string()
      .email("Informe um e-mail válido.")
      .required("O e-mail é obrigatório."),

    password: yup.string().required("A senha é obrigatória."),
  })
  .exact();

export type LoginDto = yup.InferType<typeof loginDto>;
