import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  loginSchema,
  type LoginFormData,
} from "../schemas/auth.schema";

export function useLogin() {
  return useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),

    defaultValues: {
      nip: "",
      password: "",
    },
  });
}