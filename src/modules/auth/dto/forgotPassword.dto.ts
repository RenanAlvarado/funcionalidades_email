import * as yup from "yup";

export const forgotPasswordSchema = yup.object({
  email: yup
    .string()
    .trim()
    .email("Informe um e-mail válido.")
    .required("O e-mail é obrigatório."),
});

export type ForgotPasswordDto = yup.InferType<typeof forgotPasswordSchema>;
