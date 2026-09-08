import { LoginForm } from "@/components/login-form";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <Card className="w-full max-w-md">
        <CardTitle>Óptica CR</CardTitle>
        <CardDescription>Ingrese con su cuenta interna. No hay registro público.</CardDescription>
        <div className="mt-6">
          <LoginForm />
        </div>
      </Card>
    </div>
  );
}
