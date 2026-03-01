"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { EasyBiscuitToolProps } from "@portfolio/tool-sdk";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const COMMON_CURRENCIES = ["USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "INR"];

export default function CurrencyConverter(_props: EasyBiscuitToolProps) {
  const [amount, setAmount] = useState("100");
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("GBP");
  const [rates, setRates] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/currency/rates")
      .then((r) => r.json())
      .then((data) => {
        if (data.rates) setRates(data.rates);
        else setError("Could not load rates");
      })
      .catch(() => setError("Could not load rates"))
      .finally(() => setLoading(false));
  }, []);

  const converted = useMemo(() => {
    if (!rates || !amount) return null;
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt < 0) return null;
    const fromRate = rates[fromCurrency] ?? 1;
    const toRate = rates[toCurrency] ?? 1;
    const inUsd = fromCurrency === "USD" ? amt : amt / fromRate;
    const result = toCurrency === "USD" ? inUsd : inUsd * toRate;
    return result;
  }, [rates, amount, fromCurrency, toCurrency]);

  const swap = useCallback(() => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  }, [fromCurrency, toCurrency]);

  if (loading) {
    return (
      <div className="flex min-h-[120px] items-center justify-center text-muted-foreground">
        Loading exchange rates…
      </div>
    );
  }

  if (error || !rates) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800">
        {error}. Please try again later.
      </div>
    );
  }

  const currencies = Object.keys(rates).sort();
  const displayCurrencies = [...new Set([...COMMON_CURRENCIES, ...currencies])];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium">Amount</label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="100"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">From</label>
          <select
            value={fromCurrency}
            onChange={(e) => setFromCurrency(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {displayCurrencies.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">To</label>
          <select
            value={toCurrency}
            onChange={(e) => setToCurrency(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {displayCurrencies.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>
      <button
        type="button"
        onClick={swap}
        className="text-sm text-amber-600 hover:underline"
      >
        Swap currencies
      </button>
      {converted !== null && (
        <Card>
          <CardHeader className="pb-2">
            <h3 className="text-sm font-medium">Result</h3>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold">
              {converted.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              {toCurrency}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
