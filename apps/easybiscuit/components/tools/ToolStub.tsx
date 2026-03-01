"use client";

import { Wrench } from "lucide-react";

interface ToolStubProps {
  name: string;
}

export default function ToolStub({ name }: ToolStubProps) {
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-amber-200 bg-amber-50/50 p-8">
      <Wrench className="mb-4 h-12 w-12 text-amber-500" />
      <h3 className="text-lg font-semibold text-amber-900">{name}</h3>
      <p className="mt-2 text-center text-sm text-amber-700">
        This tool is coming soon. Check back later!
      </p>
    </div>
  );
}
