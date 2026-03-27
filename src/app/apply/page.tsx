/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useCallback } from "react";
import Link from "next/link";
import { useDropzone } from "react-dropzone";

type InputMode = "pdf" | "url" | "text";

export default function ApplyPage() {
  const [form, setForm] = useState({ name: "", role: "", email: "" });
  const [inputMode, setInputMode] = useState<InputMode>("pdf");
  const [resumeText, setResumeText] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const roles = [
    "Frontend Engineer",
    "Backend Engineer",
    "Full Stack Engineer",
    "Product Designer",
    "Product Manager",
    "DevOps Engineer",
    "Data Scientist",
  ];

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) setPdfFile(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
  });

  async function handleSubmit() {
    if (!form.name || !form.role || !form.email) {
      setError("Please fill in name, email and role");
      return;
    }
    if (inputMode === "pdf" && !pdfFile) {
      setError("Please upload your resume PDF");
      return;
    }
    if (inputMode === "url" && !linkedinUrl) {
      setError("Please enter your LinkedIn or portfolio URL");
      return;
    }
    if (inputMode === "text" && !resumeText) {
      setError("Please paste your resume text");
      return;
    }

    setLoading(true);
    setError("");

    try {
      let finalResumeText = resumeText;

      if (inputMode === "pdf" && pdfFile) {
        const formData = new FormData();
        formData.append("file", pdfFile);
        const parseRes = await fetch("/api/parse-pdf", {
          method: "POST",
          body: formData,
        });
        const parseData = await parseRes.json();
        if (!parseRes.ok) throw new Error("Failed to parse PDF");
        finalResumeText = parseData.text;
      }

      const res = await fetch("/api/screen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          role: form.role,
          email: form.email,
          resumeText: finalResumeText,
          linkedinUrl: inputMode === "url" ? linkedinUrl : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data.screening);
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function handleAnother() {
    setForm({ name: "", role: "", email: "" });
    setPdfFile(null);
    setResumeText("");
    setLinkedinUrl("");
    setResult(null);
    setError("");
  }

  if (result) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 max-w-md w-full text-center">
          <div className="flex items-center justify-between mb-6">
            <Link
              href="/"
              className="text-gray-500 hover:text-gray-300 text-sm transition"
            >
              ← Home
            </Link>
            <span className="text-gray-600 text-xs">Application submitted</span>
          </div>
          <div
            className={`text-6xl font-bold mb-2 ${
              result.score >= 70
                ? "text-green-400"
                : result.score >= 50
                  ? "text-yellow-400"
                  : "text-red-400"
            }`}
          >
            {result.score}
          </div>
          <div className="text-gray-400 text-sm mb-1">AI Match Score</div>
          {result.score >= 85 && (
            <div className="inline-block bg-orange-500/20 border border-orange-500/30 text-orange-300 text-xs px-3 py-1 rounded-full mb-4">
              🔥 Top Match
            </div>
          )}
          <p className="text-gray-300 text-sm leading-relaxed mb-6 mt-4">
            {result.summary}
          </p>
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            {result.skills.map((s: string) => (
              <span
                key={s}
                className="bg-gray-800 text-gray-300 text-xs px-3 py-1 rounded-full border border-gray-700"
              >
                {s}
              </span>
            ))}
          </div>
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-blue-300 text-sm mb-6">
            ✓ Added to pipeline and synced to Notion. Check your email for
            confirmation!
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleAnother}
              className="flex-1 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 font-medium py-3 rounded-xl transition text-sm"
            >
              + Submit Another
            </button>
            <Link
              href="/dashboard"
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-xl transition text-sm text-center"
            >
              View Dashboard →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 max-w-lg w-full">
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="text-gray-500 hover:text-gray-300 text-sm transition"
          >
            ← Home
          </Link>
          <Link
            href="/dashboard"
            className="text-gray-500 hover:text-gray-300 text-sm transition"
          >
            Dashboard →
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">
            Apply to HireLoop
          </h1>
          <p className="text-gray-400 text-sm">
            AI-powered screening — get instant feedback
          </p>
        </div>

        <div className="space-y-5">
          {/* Name */}
          <div>
            <label className="text-gray-300 text-sm font-medium block mb-2">
              Full Name
            </label>
            <input
              type="text"
              placeholder="John Doe"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-gray-300 text-sm font-medium block mb-2">
              Email Address
            </label>
            <input
              type="email"
              placeholder="john@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          {/* Role */}
          <div>
            <label className="text-gray-300 text-sm font-medium block mb-2">
              Role Applying For
            </label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition"
            >
              <option value="">Select a role...</option>
              {roles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Resume Input Mode Tabs */}
          <div>
            <label className="text-gray-300 text-sm font-medium block mb-2">
              Resume / Profile
            </label>
            <div className="flex gap-1 bg-gray-800 p-1 rounded-xl mb-3">
              {(["pdf", "url", "text"] as InputMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setInputMode(mode)}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium transition ${
                    inputMode === mode
                      ? "bg-blue-600 text-white"
                      : "text-gray-400 hover:text-gray-300"
                  }`}
                >
                  {mode === "pdf"
                    ? "📄 Upload PDF"
                    : mode === "url"
                      ? "🔗 LinkedIn/URL"
                      : "📝 Paste Text"}
                </button>
              ))}
            </div>

            {/* PDF Upload */}
            {inputMode === "pdf" && (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${
                  isDragActive
                    ? "border-blue-500 bg-blue-500/5"
                    : pdfFile
                      ? "border-green-500/50 bg-green-500/5"
                      : "border-gray-700 hover:border-gray-500"
                }`}
              >
                <input {...getInputProps()} />
                {pdfFile ? (
                  <div>
                    <div className="text-green-400 text-2xl mb-2">✓</div>
                    <p className="text-green-400 text-sm font-medium">
                      {pdfFile.name}
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      Click to change file
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="text-gray-500 text-3xl mb-2">📄</div>
                    <p className="text-gray-400 text-sm">
                      {isDragActive
                        ? "Drop your PDF here"
                        : "Drag & drop your resume PDF"}
                    </p>
                    <p className="text-gray-600 text-xs mt-1">
                      or click to browse
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* URL Input */}
            {inputMode === "url" && (
              <input
                type="url"
                placeholder="https://linkedin.com/in/yourname or portfolio URL"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
              />
            )}

            {/* Paste Text */}
            {inputMode === "text" && (
              <textarea
                placeholder="Paste your resume text here..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                rows={7}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition resize-none"
              />
            )}
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold py-3 rounded-xl transition"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {inputMode === "pdf"
                  ? "Parsing PDF & screening..."
                  : "Screening with AI..."}
              </span>
            ) : (
              "Submit Application →"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
