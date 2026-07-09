import { z } from "zod";

export const loginSchema = z.object({
  nip: z
    .string()
    .min(6, "NIP minimal 6 digit"),

  password: z
    .string()
    .min(6, "Password minimal 6 karakter"),
});

export type LoginFormData = z.infer<typeof loginSchema>;