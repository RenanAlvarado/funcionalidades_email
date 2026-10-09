import * as yup from "yup";

export const resendVerificationSchema = yup.object({
  email: yup
    .string()
    .email("Informe um e-mail válido.")
    .required("O e-mail é obrigatório."),
});

export type ResendVerificationDto = yup.InferType<
  typeof resendVerificationSchema
>;
