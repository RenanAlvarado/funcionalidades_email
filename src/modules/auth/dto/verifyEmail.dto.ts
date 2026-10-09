import * as yup from "yup";

export const verifyEmailSchema = yup.object({
  token: yup.string().required("O token de confirmação é obrigatório."),
});

export type VerifyEmailDto = yup.InferType<typeof verifyEmailSchema>;
