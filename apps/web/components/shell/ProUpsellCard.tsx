"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

export function ProUpsellCard() {
  return (
    <Card className="mt-6">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4" />
          <span className="text-sm font-medium">Upgrade to Pro</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">
          Remove ads, unlock tool history, larger file limits, and more.
        </p>
        <p className="text-sm font-medium">$7/mo or $49/yr</p>
        <Button asChild size="sm" className="w-full">
          <Link href="/pricing">View Plans</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
