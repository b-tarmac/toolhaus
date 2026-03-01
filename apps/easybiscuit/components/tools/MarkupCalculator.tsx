"use client";

import { useMemo, useState } from "react";
import type { EasyBiscuitToolProps } from "@portfolio/tool-sdk";
import { calcMarkup } from "@/lib/tools/calculators";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function MarkupCalculator(_props: EasyBiscuitToolProps) {
  const [cost, setCost] = useState("");
  const [markup, setMarkup] = useState("50");

  const result = useMemo(() => {
    const c = parseFloat(cost);
    const m = parseFloat(markup);
    if (isNaN(c) || c < 0 || isNaN(m) || m < 0) return null;
    return calcMarkup(c, m);
  }, [cost, markup]);

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
            placeholder="40.00"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Markup (%)</label>
          <Input
            type="number"
            min="0"
            step="0.1"
            value={markup}
            onChange={(e) => setMarkup(e.target.value)}
            placeholder="50"
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
