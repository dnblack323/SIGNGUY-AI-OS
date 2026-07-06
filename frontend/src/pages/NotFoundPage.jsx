import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
export default function NotFoundPage() {
  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-semibold">Page not found</h1>
      <p className="text-sm text-muted-foreground">The page you’re looking for doesn’t exist.</p>
      <Button asChild><Link to="/">Go home</Link></Button>
    </div>
  );
}
