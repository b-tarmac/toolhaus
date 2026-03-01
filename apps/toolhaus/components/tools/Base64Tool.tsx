"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { parseAsStringLiteral, parseAsString, useQueryState } from "nuqs";
import type { ToolProps } from "@portfolio/tool-sdk";
import {
  encodeBase64,
  decodeBase64,
  fileToBase64,
} from "@/lib/tools/base64";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import {
  useWorkspaceReportState,
  useWorkspaceInitialState,
} from "@/components/workspaces/WorkspaceContext";
import { BatchToolLayout } from "./BatchToolLayout";

const modeParser = parseAsStringLiteral(["encode", "decode"]).withDefault("encode");
const variantParser = parseAsStringLiteral(["standard", "url-safe"]).withDefault("standard");
const inputParser = parseAsString.withDefault("");
const inputTypeParser = parseAsStringLiteral(["text", "file"]).withDefault("text");

const MAX_FILE_FREE = 5 * 1024 * 1024;
const MAX_FILE_PRO = 50 * 1024 * 1024;

export default function Base64Tool(props: ToolProps) {
  const { user } = useAuth();
  const isPro = user?.publicMetadata?.plan === "pro";
  const maxFile = isPro ? MAX_FILE_PRO : MAX_FILE_FREE;

  const [input, setInput] = useQueryState("input", inputParser);
  const [mode, setMode] = useQueryState("mode", modeParser);
  const [variant, setVariant] = useQueryState("variant", variantParser);
  const [inputType, setInputType] = useQueryState("inputType", inputTypeParser);
  const [fileOutput, setFileOutput] = useState("");
  const [drag, setDrag] = useState(false);

  const initialState = useWorkspaceInitialState();
  useEffect(() => {
    if (!initialState) return;
    if (typeof initialState.input === "string") setInput(initialState.input);
    if (typeof initialState.mode === "string") setMode(initialState.mode as "encode" | "decode");
    if (typeof initialState.variant === "string") setVariant(initialState.variant as "standard" | "url-safe");
    if (typeof initialState.inputType === "string") setInputType(initialState.inputType as "text" | "file");
  }, [initialState]);

  useWorkspaceReportState({ input, mode, variant, inputType });

  const batchOptionsForm = (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={mode === "encode" ? "default" : "outline"}
        size="sm"
        onClick={() => setMode("encode")}
      >
        Encode
      </Button>
      <Button
        variant={mode === "decode" ? "default" : "outline"}
        size="sm"
        onClick={() => setMode("decode")}
      >
        Decode
      </Button>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={variant === "url-safe"}
          onChange={(e) => setVariant(e.target.checked ? "url-safe" : "standard")}
        />
        URL-safe
      </label>
    </div>
  );

  const textOutput = useMemo(() => {
    if (mode === "encode")
      return encodeBase64(input, variant === "url-safe").output;
    return decodeBase64(input, variant === "url-safe").output;
  }, [input, mode, variant]);

  const handleFile = useCallback(
    async (file: File) => {
      if (file.size > maxFile) {
        setFileOutput(`File too large. Max ${isPro ? "50MB" : "5MB"} for ${isPro ? "Pro" : "free"}.`);
        return;
      }
      const r = await fileToBase64(file);
      if (r.isValid) setFileOutput(r.output);
      else setFileOutput(r.error?.message ?? "Error");
    },
    [maxFile, isPro]
  );

  return (
    <BatchToolLayout
      toolSlug="base64-tool"
      toolName="Base64"
      isPro={!!isPro}
      singleContent={
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button
          variant={inputType === "text" ? "default" : "outline"}
          size="sm"
          onClick={() => setInputType("text")}
        >
          Text
        </Button>
        <Button
          variant={inputType === "file" ? "default" : "outline"}
          size="sm"
          onClick={() => setInputType("file")}
        >
          File
        </Button>
        <Button
          variant={mode === "encode" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("encode")}
        >
          Encode
        </Button>
        <Button
          variant={mode === "decode" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("decode")}
        >
          Decode
        </Button>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={variant === "url-safe"}
            onChange={(e) => setVariant(e.target.checked ? "url-safe" : "standard")}
          />
          URL-safe
        </label>
      </div>

      {inputType === "text" ? (
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Input</label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="h-48 w-full rounded-md border bg-muted/30 p-3 font-mono text-sm"
              placeholder={mode === "encode" ? "Text to encode" : "Base64 to decode"}
              spellCheck={false}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {input.length} characters
            </p>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Output</label>
            <textarea
              value={textOutput}
              readOnly
              className="h-48 w-full rounded-md border bg-muted/30 p-3 font-mono text-sm"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {textOutput.length} characters
            </p>
          </div>
        </div>
      ) : (
        <div
          className={`rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
            drag ? "border-primary bg-primary/5" : "border-muted"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            const f = e.dataTransfer.files[0];
            if (f) handleFile(f);
          }}
        >
          <p className="text-muted-foreground">
            Drag and drop a file, or{" "}
            <label className="cursor-pointer text-primary hover:underline">
              <input
                type="file"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />
              browse
            </label>
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Max {isPro ? "50MB" : "5MB"} per file
          </p>
          {fileOutput && (
            <textarea
              value={fileOutput}
              readOnly
              className="mt-4 h-32 w-full rounded-md border bg-muted/30 p-3 font-mono text-xs"
            />
          )}
        </div>
      )}
    </div>
      }
      batchOptions={{ mode, urlSafe: variant === "url-safe" }}
      batchOptionsForm={batchOptionsForm}
      batchPlaceholder={mode === "encode" ? "One line per string to encode" : "One line per Base64 string to decode"}
    />
  );
}
