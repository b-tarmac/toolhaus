"use client";

import { useMemo, useState } from "react";
import type { EasyBiscuitToolProps } from "@portfolio/tool-sdk";
import { calcDiscount } from "@/lib/tools/calculators";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function DiscountCalculator(_props: EasyBiscuitToolProps) {
  const [original, setOriginal] = useState("");
  const [discount, setDiscount] = useState("20");

  const result = useMemo(() => {
    const o = parseFloat(original);
    const d = parseFloat(discount);
    if (isNaN(o) || o < 0 || isNaN(d) || d < 0 || d > 100) return null;
    return calcDiscount(o, d);
  }, [original, discount]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Original Price (£)</label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={original}
            onChange={(e) => setOriginal(e.target.value)}
            placeholder="100.00"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Discount (%)</label>
          <Input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
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
              <span className="text-muted-foreground">Savings:</span>
              <span className="font-medium">£{result.savings.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Final price:</span>
              <span className="font-medium">£{result.finalPrice.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
