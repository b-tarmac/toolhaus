"use client";

import { useMemo, useState } from "react";
import type { EasyBiscuitToolProps } from "@portfolio/tool-sdk";
import { calcLatePaymentInterest } from "@/lib/tools/calculators";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function LatePaymentCalculator(_props: EasyBiscuitToolProps) {
  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState("8");
  const [days, setDays] = useState("30");

  const result = useMemo(() => {
    const p = parseFloat(principal);
    const r = parseFloat(rate);
    const d = parseFloat(days);
    if (isNaN(p) || p < 0 || isNaN(r) || r < 0 || isNaN(d) || d < 0) return null;
    return calcLatePaymentInterest(p, r, d);
  }, [principal, rate, days]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium">Principal Amount (£)</label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
            placeholder="1000"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Annual Interest Rate (%)</label>
          <Input
            type="number"
            min="0"
            step="0.1"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            placeholder="8"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Days Late</label>
          <Input
            type="number"
            min="0"
            value={days}
            onChange={(e) => setDays(e.target.value)}
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
              <span className="text-muted-foreground">Interest due:</span>
              <span className="font-medium">£{result.interest.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total (principal + interest):</span>
              <span className="font-medium">£{result.total.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
