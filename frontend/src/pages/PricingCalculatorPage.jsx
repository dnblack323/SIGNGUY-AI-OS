import { useMemo, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import api, { extractError } from "@/lib/api";
import PageHeader from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import MoneyInput from "@/components/forms/MoneyInput";
import { centsToDollarsString } from "@/lib/format";
import { Calculator, Loader2 } from "lucide-react";

const fmtUSD = (n) => Number(n || 0).toLocaleString("en-US", { style: "currency", currency: "USD" });
const fmtPct = (n) => `${Number(n || 0).toFixed(2)}%`;

export default function PricingCalculatorPage() {
  const { data: settings } = useQuery({ queryKey: ["pricing-settings"], queryFn: async () => (await api.get("/pricing/settings")).data });

  const [form, setForm] = useState({
    category: "banners",
    width_inches: 48,
    height_inches: 96,
    quantity: 1,
    material_key: "",
    design_needed: false,
    install_needed: false,
    manual_selling_price: null,
  });

  const materialOptions = useMemo(() => {
    if (!settings) return [];
    return Object.entries(settings.materials || {})
      .filter(([, m]) => m.category === form.category)
      .map(([key, m]) => ({ key, label: `${m.name} — $${m.cost_per_sqft}/sqft cost` }));
  }, [settings, form.category]);

  const [result, setResult] = useState(null);

  const calc = useMutation({
    mutationFn: async () => (await api.post("/pricing/calculate", {
      category: form.category,
      width_inches: Number(form.width_inches) || 0,
      height_inches: Number(form.height_inches) || 0,
      quantity: Number(form.quantity) || 1,
      material_key: form.material_key || null,
      design_needed: form.design_needed,
      install_needed: form.install_needed,
      manual_selling_price: form.manual_selling_price != null ? Number(form.manual_selling_price) : null,
    })).data,
    onSuccess: (data) => setResult(data),
    onError: (e) => toast.error(extractError(e)),
  });

  const upd = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="space-y-4" data-testid="pricing-calculator-page">
      <PageHeader title="Pricing Calculator" subtitle="Estimate a price using your tenant’s current pricing settings." />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Inputs</CardTitle></CardHeader>
          <CardContent className="grid gap-3">
            <div className="grid gap-1.5">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v, material_key: "" }))}>
                <SelectTrigger data-testid="calc-category-select"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(settings?.category_meta || {}).map(([id, m]) => <SelectItem key={id} value={id}>{m.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="grid gap-1.5"><Label>Width (in)</Label><Input type="number" value={form.width_inches} onChange={(e) => upd("width_inches")(e.target.value)} data-testid="calc-width-input" /></div>
              <div className="grid gap-1.5"><Label>Height (in)</Label><Input type="number" value={form.height_inches} onChange={(e) => upd("height_inches")(e.target.value)} data-testid="calc-height-input" /></div>
              <div className="grid gap-1.5"><Label>Quantity</Label><Input type="number" min="1" value={form.quantity} onChange={(e) => upd("quantity")(e.target.value)} data-testid="calc-quantity-input" /></div>
            </div>
            {materialOptions.length > 0 && (
              <div className="grid gap-1.5">
                <Label>Material (optional)</Label>
                <Select value={form.material_key || "__default__"} onValueChange={(v) => upd("material_key")(v === "__default__" ? "" : v)}>
                  <SelectTrigger data-testid="calc-material-select"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__default__">Use category default</SelectItem>
                    {materialOptions.map((m) => <SelectItem key={m.key} value={m.key}>{m.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex items-center gap-6 pt-1">
              <label className="flex items-center gap-2 text-sm cursor-pointer"><Switch checked={form.design_needed} onCheckedChange={upd("design_needed")} data-testid="calc-design-switch" />Design needed</label>
              <label className="flex items-center gap-2 text-sm cursor-pointer"><Switch checked={form.install_needed} onCheckedChange={upd("install_needed")} data-testid="calc-install-switch" />Install needed</label>
            </div>
            <div className="grid gap-1.5">
              <Label>Manual selling price override (optional)</Label>
              <MoneyInput value={form.manual_selling_price ? Math.round(form.manual_selling_price * 100) : 0} onChange={(cents) => upd("manual_selling_price")(cents ? cents / 100 : null)} testId="calc-manual-override" />
            </div>
            <Button onClick={() => calc.mutate()} disabled={calc.isPending} data-testid="calc-run-button">
              {calc.isPending && <Loader2 className="size-4 mr-2 animate-spin" />}<Calculator className="size-4 mr-1" />Calculate
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Result</CardTitle></CardHeader>
          <CardContent>
            {!result ? (
              <div className="text-sm text-muted-foreground">Fill in inputs and click Calculate.</div>
            ) : (
              <div className="space-y-4" data-testid="calc-result">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border p-3">
                    <div className="text-xs text-muted-foreground">Selling price</div>
                    <div className="text-2xl font-semibold tabular-nums" data-testid="calc-selling-price">{fmtUSD(result.selling_price)}</div>
                  </div>
                  <div className="rounded-lg border p-3">
                    <div className="text-xs text-muted-foreground">Profit margin</div>
                    <div className="text-2xl font-semibold tabular-nums" data-testid="calc-margin">{fmtPct(result.profit_margin_percent)}</div>
                    <div className="text-xs text-muted-foreground mt-1">{fmtUSD(result.profit_amount)} profit</div>
                  </div>
                </div>

                <div className="rounded-lg border">
                  <div className="px-3 py-2 border-b flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Cost breakdown</span>
                    <span className="capitalize text-muted-foreground">Method: {String(result.pricing_method_used).replace("_", " ")}</span>
                  </div>
                  <ul className="divide-y">
                    {result.breakdown.map((row, i) => (
                      <li key={i} className="flex items-center justify-between px-3 py-2 text-sm">
                        <span className="text-muted-foreground">{row.label}</span>
                        <span className="tabular-nums">{fmtUSD(row.amount)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                  <div>Area (total): <span className="tabular-nums text-foreground">{result.area_sqft_total} sqft</span></div>
                  <div>Quantity: <span className="tabular-nums text-foreground">{result.quantity}</span></div>
                  <div>Material: <span className="mono text-foreground">{result.material_key || "—"}</span></div>
                  <div>Category: <span className="capitalize text-foreground">{result.category.replace("_"," ")}</span></div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
