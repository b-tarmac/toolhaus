"use client";

import { useMemo, useState } from "react";
import type { EasyBiscuitToolProps } from "@portfolio/tool-sdk";
import { calcBreakEven } from "@/lib/tools/calculators";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function BreakEvenCalculator(_props: EasyBiscuitToolProps) {
  const [fixedCosts, setFixedCosts] = useState("");
  const [variableCost, setVariableCost] = useState("");
  const [pricePerUnit, setPricePerUnit] = useState("");

  const result = useMemo(() => {
    const fc = parseFloat(fixedCosts);
    const vc = parseFloat(variableCost);
    const ppu = parseFloat(pricePerUnit);
    if (isNaN(fc) || fc < 0 || isNaN(vc) || vc < 0 || isNaN(ppu) || ppu < 0)
      return null;
    return calcBreakEven(fc, vc, ppu);
  }, [fixedCosts, variableCost, pricePerUnit]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium">Fixed Costs (£)</label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={fixedCosts}
            onChange={(e) => setFixedCosts(e.target.value)}
            placeholder="5000"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Variable Cost per Unit (£)</label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={variableCost}
            onChange={(e) => setVariableCost(e.target.value)}
            placeholder="10"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Price per Unit (£)</label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={pricePerUnit}
            onChange={(e) => setPricePerUnit(e.target.value)}
            placeholder="25"
          />
        </div>
      </div>
      {result && (
        <Card>
          <CardHeader className="pb-2">
            <h3 className="text-sm font-medium">Result</h3>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            {result.breakEvenUnits !== null ? (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Break-even units:</span>
                  <span className="font-medium">
                    {Math.ceil(result.breakEvenUnits).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Contribution per unit:</span>
                  <span className="font-medium">£{result.contribution.toFixed(2)}</span>
                </div>
              </>
            ) : (
              <p className="text-amber-600">
                Price must be greater than variable cost to break even.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
