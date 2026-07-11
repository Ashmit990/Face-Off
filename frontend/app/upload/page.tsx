"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { uploadCV } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function UploadPage() {
  const router = useRouter();
  const { refreshProfile } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [dragOver, setDragOver] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Please choose a PDF file first.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await uploadCV(file, jobDescription);
      setResult(res);
      await refreshProfile();
    } catch (err: any) {
      setError(err.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.type === "application/pdf") {
      setFile(dropped);
      setError(null);
    } else {
      setError("Only PDF files are supported.");
    }
  }

  return (
    <ProtectedRoute>
      <div className="w-full max-w-[680px]">
        {/* Header */}
        <div className="animate-fade-up mb-8">
          <div className="badge badge-green mb-4">
            <span className="badge-dot" />
            CV &amp; Target Role
          </div>
          <h1 className="font-display text-[32px] font-bold tracking-tight text-ink mb-2">
            Upload your CV
          </h1>
          <p className="text-[15px] leading-relaxed text-subtle max-w-[500px]">
            Faceoff reads your CV once and personalises every future interview. Add a job description to make questions laser-targeted.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="animate-fade-up stagger-1 flex flex-col gap-5">
          {/* File drop zone */}
          <div>
            <label className="field-label">CV (PDF only)</label>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`glass-card flex flex-col items-center justify-center gap-3 p-8 text-center cursor-pointer transition-all duration-200 ${
                dragOver ? "border-accent border-opacity-60 bg-brand-100" : "hover:border-border-hover"
              }`}
              onClick={() => document.getElementById("cv-file-input")?.click()}
            >
              {file ? (
                <>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 text-accent">
                    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="1.6" />
                      <path d="M14 2v6h6M9 13h6M9 17h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-ink">{file.name}</p>
                    <p className="text-[12px] text-muted mt-0.5">{(file.size / 1024).toFixed(0)} KB · PDF</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    className="text-[12px] text-danger-400 hover:underline"
                  >
                    Remove file
                  </button>
                </>
              ) : (
                <>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-colors ${
                    dragOver ? "bg-brand-200 text-accent" : "bg-elevated text-muted"
                  }`}>
                    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
                      <path d="M12 16V4M8 8l4-4 4 4M4 18h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-ink">Drop your PDF here</p>
                    <p className="text-[12.5px] text-muted mt-0.5">or click to browse</p>
                  </div>
                  <span className="text-[11.5px] font-mono text-muted border border-border rounded px-2 py-0.5">PDF only · Max 10MB</span>
                </>
              )}
            </div>
            <input
              id="cv-file-input"
              type="file"
              accept="application/pdf"
              onChange={(e) => { setFile(e.target.files?.[0] || null); setError(null); }}
              className="hidden"
            />
          </div>

          {/* Job description */}
          <div>
            <label className="field-label" htmlFor="job-desc">
              Job Description{" "}
              <span className="font-normal normal-case tracking-normal text-muted">(optional)</span>
            </label>
            <textarea
              id="job-desc"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={5}
              placeholder="Paste the job description you're preparing for…"
              className="input-field"
            />
          </div>

          {error && <div className="alert-error animate-fade-in">{error}</div>}

          {result && (
            <div className="alert-success animate-fade-in">
              <div className="font-semibold mb-1">✓ Uploaded successfully</div>
              <div className="text-[13px] opacity-80">Sections found: {result.sections_found?.join(", ")}</div>
            </div>
          )}

          <div className="flex flex-wrap gap-3 pt-2">
            <button type="submit" disabled={loading || !file} className="btn-primary disabled:opacity-40">
              {loading ? (
                <>
                  <span className="spinner" style={{ borderTopColor: "#09090b" }} />
                  Uploading…
                </>
              ) : (
                <>
                  <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
                    <path d="M10 14V4M6 8l4-4 4 4M3 15v1a2 2 0 002 2h10a2 2 0 002-2v-1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Upload CV
                </>
              )}
            </button>
            {result && (
              <button
                type="button"
                onClick={() => router.push("/interview")}
                className="btn-primary"
              >
                Start Interview
                <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
}
