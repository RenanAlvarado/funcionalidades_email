import * as yup from "yup";

export const registerDto = yup
  .object({
    name: yup
      .string()
      .trim()
      .min(2, "O nome deve ter pelo menos 2 caracteres.")
      .max(100, "O nome deve ter no máximo 100 caracteres.")
      .required("O nome é obrigatório."),

    email: yup
      .string()
      .trim()
      .lowercase()
      .email("Informe um e-mail válido.")
      .required("O e-mail é obrigatório."),

    password: yup
      .string()
      .min(8, "A senha deve ter pelo menos 8 caracteres.")
      .required("A senha é obrigatória."),
  })
  .exact("A requisição contém campos não permitidos.");

export type RegisterDto = yup.InferType<typeof registerDto>;
