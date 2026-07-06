import { useAuth } from "@/auth/AuthContext";

export function PermissionGate({ perm, anyOf, children, fallback = null }) {
  const { hasPerm, hasAny } = useAuth();
  const ok = perm ? hasPerm(perm) : (anyOf ? hasAny(anyOf) : true);
  if (!ok) return fallback;
  return <div data-testid="permission-gate">{children}</div>;
}

export default PermissionGate;
