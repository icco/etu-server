import type { Metadata } from "next"
import { RegisterForm } from "./register-form"

export const metadata: Metadata = {
  title: "Sign Up | Etu",
}

export default function RegisterPage() {
  return <RegisterForm />
}
