"use client";

import { useMemo, useState } from "react";
import type { EasyBiscuitToolProps } from "@portfolio/tool-sdk";
import { calcVat } from "@/lib/tools/calculators";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function VatCalculator(_props: EasyBiscuitToolProps) {
  const [amount, setAmount] = useState("");
  const [rate, setRate] = useState("20");

  const result = useMemo(() => {
    const a = parseFloat(amount);
    const r = parseFloat(rate);
    if (isNaN(a) || a < 0 || isNaN(r) || r < 0) return null;
    return calcVat(a, r);
  }, [amount, rate]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Amount (£)</label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="100.00"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">VAT / GST Rate (%)</label>
          <Input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            placeholder="20"
          />
        </div>
      </div>
      {result && (
        <Card>
          <CardHeader className="pb-2">
            <h3 className="text-sm font-medium">Result</h3>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax amount:</span>
              <span className="font-medium">£{result.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total:</span>
              <span className="font-medium">£{result.total.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
