import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/auth/AuthContext";
import { extractError } from "@/lib/api";
import { Loader2, Building2 } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login, user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  useEffect(() => { if (!loading && user) navigate(from, { replace: true }); }, [user, loading, navigate, from]);

  async function onSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(email, password);
      toast.success("Signed in");
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(extractError(err, "Invalid credentials"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-dvh grid place-items-center px-4 py-10 header-wash">
      <Card className="w-full max-w-[420px]">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground"><Building2 className="size-4" /></div>
            <div>
              <CardTitle className="font-display">SignGuy AI</CardTitle>
              <CardDescription>Sign in to your shop</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid gap-3" data-testid="login-form">
            <div className="grid gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" data-testid="login-email-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" data-testid="login-password-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
            </div>
            <Button type="submit" disabled={submitting} data-testid="login-submit-button">
              {submitting && <Loader2 className="size-4 mr-2 animate-spin" />}
              Sign in
            </Button>
            <div className="flex justify-between text-sm text-muted-foreground pt-1">
              <Link className="link-underline" to="/forgot-password" data-testid="login-forgot-link">Forgot password?</Link>
              <Link className="link-underline" to="/register" data-testid="login-register-link">Create a shop</Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
