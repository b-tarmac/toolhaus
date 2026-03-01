"use client";

import { useMemo, useState } from "react";
import type { EasyBiscuitToolProps } from "@portfolio/tool-sdk";
import { calcHourlyRate } from "@/lib/tools/calculators";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function HourlyRateCalculator(_props: EasyBiscuitToolProps) {
  const [annualIncome, setAnnualIncome] = useState("");
  const [hoursPerWeek, setHoursPerWeek] = useState("40");

  const result = useMemo(() => {
    const ann = parseFloat(annualIncome);
    const hrs = parseFloat(hoursPerWeek);
    if (isNaN(ann) || ann < 0 || isNaN(hrs) || hrs <= 0 || hrs > 168) return null;
    return calcHourlyRate(ann, hrs);
  }, [annualIncome, hoursPerWeek]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Annual Income (£)</label>
          <Input
            type="number"
            min="0"
            step="100"
            value={annualIncome}
            onChange={(e) => setAnnualIncome(e.target.value)}
            placeholder="50000"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Hours per Week</label>
          <Input
            type="number"
            min="0.1"
            max="168"
            step="0.5"
            value={hoursPerWeek}
            onChange={(e) => setHoursPerWeek(e.target.value)}
            placeholder="40"
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
              <span className="text-muted-foreground">Hourly rate:</span>
              <span className="font-medium">£{result.hourlyRate.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Annual hours:</span>
              <span className="font-medium">{result.annualHours.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
