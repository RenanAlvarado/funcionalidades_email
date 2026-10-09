import * as yup from "yup";
import { registerDto } from "../../auth/dto/register.dto";

export const updateUserDto = registerDto
  .partial()
  .test(
    "at-least-one-field",
    "Informe ao menos um campo para atualizar.",
    (value) =>
      value !== undefined &&
      Object.values(value).some((field) => field !== undefined),
  );

export type UpdateUserDto = yup.InferType<typeof updateUserDto>;
