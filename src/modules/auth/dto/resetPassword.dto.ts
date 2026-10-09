import * as yup from "yup";

export const resetPasswordSchema = yup.object({
  token: yup.string().required("O token de redefinição é obrigatório."),

  password: yup
    .string()
    .min(8, "A senha deve ter pelo menos 8 caracteres.")
    .required("A nova senha é obrigatória."),
});

export type ResetPasswordDto = yup.InferType<typeof resetPasswordSchema>;
