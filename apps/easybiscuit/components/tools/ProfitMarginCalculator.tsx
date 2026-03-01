"use client";

import { useMemo, useState } from "react";
import type { EasyBiscuitToolProps } from "@portfolio/tool-sdk";
import { calcProfitMargin } from "@/lib/tools/calculators";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function ProfitMarginCalculator(_props: EasyBiscuitToolProps) {
  const [cost, setCost] = useState("");
  const [margin, setMargin] = useState("30");

  const result = useMemo(() => {
    const c = parseFloat(cost);
    const m = parseFloat(margin);
    if (isNaN(c) || c < 0 || isNaN(m) || m <= 0 || m >= 100) return null;
    return calcProfitMargin(c, m);
  }, [cost, margin]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Cost (£)</label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            placeholder="50.00"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Profit Margin (%)</label>
          <Input
            type="number"
            min="0.01"
            max="99.99"
            step="0.1"
            value={margin}
            onChange={(e) => setMargin(e.target.value)}
            placeholder="30"
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
              <span className="text-muted-foreground">Selling price:</span>
              <span className="font-medium">£{result.sellingPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Profit:</span>
              <span className="font-medium">£{result.profit.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
