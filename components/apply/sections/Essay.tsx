"use client";

import { useRef } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { Upload, X, FileText } from "lucide-react";
import { SectionHeader } from "../Field";
import type { StudentProfile } from "@/lib/types";

type Props = {
  pdfName: string | null;
  onPdfChange: (base64: string, name: string) => void;
  onPdfRemove: () => void;
};

export function EssaySection({ pdfName, onPdfChange, onPdfRemove }: Props) {
  const { register, control, formState: { errors } } = useFormContext<StudentProfile>();
  const essay = useWatch({ control, name: "essay", defaultValue: "" });
  const charCount = essay?.length ?? 0;
  const wordCount = essay?.trim() ? essay.trim().split(/\s+/).length : 0;
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (file.type !== "application/pdf") return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      const base64 = result.split(",")[1];
      onPdfChange(base64, file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <section>
      <SectionHeader
        step={6}
        title="Personal Essay"
        blurb="Your personal statement. We'll run it through an AI admissions reader and factor the score into your chances — especially at schools where essays are rated 'very important'."
      />
      <div className="flex flex-col gap-4">
        {pdfName ? (
          <div className="flex items-center gap-3 rounded-lg border border-border bg-card/60 px-4 py-3">
            <FileText className="size-4 shrink-0 text-muted-foreground" />
            <span className="flex-1 truncate text-sm text-foreground">{pdfName}</span>
            <button
              type="button"
              onClick={onPdfRemove}
              className="rounded p-0.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
        ) : (
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => inputRef.current?.click()}
            className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed border-border bg-card/30 px-6 py-6 text-center transition-colors hover:border-foreground/30 hover:bg-muted/40"
          >
            <Upload className="size-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-foreground">Upload PDF</p>
              <p className="text-xs text-muted-foreground">Drag & drop or click to browse</p>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
          </div>
        )}

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">or type directly below</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="flex flex-col gap-2">
          <textarea
            rows={10}
            maxLength={3500}
            placeholder="Tell us about yourself. What makes you you? Committees read thousands of essays — the ones that stand out are specific, honest, and go somewhere unexpected…"
            className="w-full resize-y rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            {...register("essay")}
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {errors.essay ? (
                <span className="text-destructive">{errors.essay.message}</span>
              ) : (
                "Optional — but it will affect your results."
              )}
            </span>
            <span>{wordCount} words · {charCount}/3500</span>
          </div>
        </div>
      </div>
    </section>
  );
}
