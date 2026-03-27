/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const STATUSES = [
  "Applied",
  "Screened",
  "Interview",
  "Offer",
  "Hired",
  "Rejected",
];

const STATUS_COLORS: Record<string, string> = {
  Applied: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  Screened: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  Interview: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  Offer: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  Hired: "bg-green-500/20 text-green-300 border-green-500/30",
  Rejected: "bg-red-500/20 text-red-300 border-red-500/30",
};

const STATUS_ACTIONS: Record<string, { primary: string; secondary: string }> = {
  Applied: { primary: "Move to Screened", secondary: "Reject" },
  Screened: { primary: "Move to Interview", secondary: "Reject" },
  Interview: { primary: "Make Offer", secondary: "Decline" },
  Offer: { primary: "Hire", secondary: "Decline" },
  Hired: { primary: "", secondary: "" },
  Rejected: { primary: "Restore to Applied", secondary: "" },
};

const STATUS_NEXT: Record<string, string> = {
  Applied: "Screened",
  Screened: "Interview",
  Interview: "Offer",
  Offer: "Hired",
};
const STATUS_DECLINE: Record<string, string> = {
  Applied: "Rejected",
  Screened: "Rejected",
  Interview: "Rejected",
  Offer: "Rejected",
  Rejected: "Applied",
};

function InterviewQuestions({ candidate }: { candidate: any }) {
  const [questions, setQuestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  async function generate() {
    setLoading(true);
    try {
      const res = await fetch("/api/interview-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: candidate.name,
          role: candidate.role,
          aiSummary: candidate.aiSummary,
          skills: candidate.skills,
        }),
      });
      const data = await res.json();
      setQuestions(data.questions || []);
      setGenerated(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  if (!generated) {
    return (
      <button
        onClick={generate}
        disabled={loading}
        className="w-full bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-300 text-sm font-medium py-2.5 rounded-xl transition mb-3 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <span className="w-3.5 h-3.5 border-2 border-purple-300/30 border-t-purple-300 rounded-full animate-spin" />
            Generating questions...
          </>
        ) : (
          "✨ Generate AI Interview Questions"
        )}
      </button>
    );
  }

  return (
    <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-4 mb-3">
      <p className="text-purple-300 text-xs font-semibold mb-3">
        ✨ AI INTERVIEW QUESTIONS
      </p>
      <ol className="space-y-3">
        {questions.map((q, i) => (
          <li key={i} className="flex gap-2 text-sm text-gray-300">
            <span className="text-purple-400 font-bold shrink-0">{i + 1}.</span>
            <span className="leading-relaxed">{q}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function DashboardPage() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [selected, setSelected] = useState<any | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);

  async function fetchCandidates() {
    setLoading(true);
    const res = await fetch("/api/candidates");
    const data = await res.json();
    setCandidates(data.candidates || []);
    setLoading(false);
  }

  useEffect(() => {
    async function load() {
      await fetchCandidates();
    }
    void load();
  }, []);

  async function updateStatus(id: string, status: string) {
    setUpdating(id);
    await fetch("/api/candidates", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (selected?.id === id) setSelected((prev: any) => ({ ...prev, status }));
    await fetchCandidates();
    setUpdating(null);
  }

  // Drag handlers
  function onDragStart(e: React.DragEvent, candidateId: string) {
    e.dataTransfer.setData("candidateId", candidateId);
  }

  function onDragOver(e: React.DragEvent, status: string) {
    e.preventDefault();
    setDragOver(status);
  }

  function onDragLeave() {
    setDragOver(null);
  }

  async function onDrop(e: React.DragEvent, status: string) {
    e.preventDefault();
    setDragOver(null);
    const id = e.dataTransfer.getData("candidateId");
    const candidate = candidates.find((c) => c.id === id);
    if (candidate && candidate.status !== status) {
      await updateStatus(id, status);
    }
  }

  const byStatus = STATUSES.reduce(
    (acc, s) => {
      acc[s] = candidates.filter((c) => c.status === s);
      return acc;
    },
    {} as Record<string, any[]>,
  );

  const reviewQueue = candidates.filter(
    (c) => c.aiScore >= 70 && c.status === "Applied",
  );
  const avgScore = candidates.length
    ? Math.round(
        candidates.reduce((sum, c) => sum + (c.aiScore || 0), 0) /
          candidates.length,
      )
    : 0;
  const hiredCount = candidates.filter((c) => c.status === "Hired").length;
  const hireRate = candidates.length
    ? Math.round((hiredCount / candidates.length) * 100)
    : 0;

  const actions = selected ? STATUS_ACTIONS[selected.status] : null;

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-gray-500 hover:text-gray-300 text-sm transition"
            >
              ← Home
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">
                HireLoop Dashboard
              </h1>
              <p className="text-gray-400 text-sm">
                {candidates.length} candidates · drag cards to move stages
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link
              href="/apply"
              className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
            >
              + New Application
            </Link>
            <button
              onClick={fetchCandidates}
              className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm px-4 py-2 rounded-lg border border-gray-700 transition"
            >
              ↻ Refresh
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4 animate-pulse">
                <div className="h-7 w-12 bg-gray-700 rounded mb-2" />
                <div className="h-3 w-24 bg-gray-800 rounded" />
              </div>
            ))
          ) : (
            [
              { label: "Total Candidates", value: candidates.length, color: "text-white" },
              { label: "Avg AI Score", value: avgScore, color: avgScore >= 70 ? "text-green-400" : "text-yellow-400" },
              { label: "Hired", value: hiredCount, color: "text-green-400" },
              { label: "Hire Rate", value: `${hireRate}%`, color: "text-blue-400" },
            ].map((stat) => (
              <div key={stat.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-gray-500 text-xs mt-1">{stat.label}</div>
              </div>
            ))
          )}
        </div>

        {/* AI Review Queue */}
        {reviewQueue.length > 0 && (
          <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-orange-300 font-semibold text-sm">
                🔥 AI Review Queue
              </span>
              <span className="bg-orange-500/20 text-orange-300 text-xs px-2 py-0.5 rounded-full border border-orange-500/30">
                {reviewQueue.length} need your decision
              </span>
            </div>
            <div className="flex flex-wrap gap-3">
              {reviewQueue.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelected(c)}
                  className="bg-gray-900 border border-orange-500/30 hover:border-orange-400/50 rounded-lg px-4 py-2 text-left transition"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-white text-sm font-medium">
                      {c.name}
                    </span>
                    <span className="text-green-400 text-xs font-bold">
                      {c.aiScore}/100
                    </span>
                    {c.aiScore >= 85 && (
                      <span className="text-orange-300 text-xs">🔥</span>
                    )}
                  </div>
                  <div className="text-gray-400 text-xs">{c.role}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Pipeline Board */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {STATUSES.map((status) => (
              <div key={status} className="bg-gray-900 border border-gray-800 rounded-xl p-3 animate-pulse">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-5 w-16 bg-gray-700 rounded-full" />
                  <div className="h-4 w-4 bg-gray-800 rounded" />
                </div>
                <div className="space-y-2">
                  {Array.from({ length: status === "Applied" ? 3 : status === "Screened" ? 2 : 1 }).map((_, i) => (
                    <div key={i} className="bg-gray-800 border border-gray-700 rounded-lg p-3">
                      <div className="h-3.5 w-3/4 bg-gray-700 rounded mb-1.5" />
                      <div className="h-3 w-1/2 bg-gray-800 rounded mb-2" />
                      <div className="h-3 w-8 bg-gray-700 rounded" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {STATUSES.map((status) => (
              <div
                key={status}
                onDragOver={(e) => onDragOver(e, status)}
                onDragLeave={onDragLeave}
                onDrop={(e) => onDrop(e, status)}
                className={`rounded-xl p-3 border transition-all ${
                  dragOver === status
                    ? "bg-blue-500/10 border-blue-500/50 scale-[1.02]"
                    : "bg-gray-900 border-gray-800"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full border ${STATUS_COLORS[status]}`}
                  >
                    {status}
                  </span>
                  <span className="text-gray-500 text-xs">
                    {byStatus[status].length}
                  </span>
                </div>
                <div className="space-y-2">
                  {byStatus[status].map((c) => (
                    <div
                      key={c.id}
                      draggable
                      onDragStart={(e) => onDragStart(e, c.id)}
                      onClick={() => setSelected(c)}
                      className="bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-lg p-3 cursor-grab active:cursor-grabbing transition select-none"
                    >
                      <div className="flex items-center gap-1 mb-0.5">
                        <p className="text-white text-sm font-medium truncate flex-1">
                          {c.name}
                        </p>
                        {c.aiScore >= 85 && (
                          <span className="text-orange-300 text-xs">🔥</span>
                        )}
                      </div>
                      <p className="text-gray-400 text-xs truncate mb-2">
                        {c.role}
                      </p>
                      <span
                        className={`text-xs font-bold ${
                          c.aiScore >= 70
                            ? "text-green-400"
                            : c.aiScore >= 50
                              ? "text-yellow-400"
                              : "text-red-400"
                        }`}
                      >
                        {c.aiScore ? `${c.aiScore}/100` : "—"}
                      </span>
                    </div>
                  ))}
                  {byStatus[status].length === 0 && (
                    <div
                      className={`rounded-lg border-2 border-dashed py-6 text-center transition ${
                        dragOver === status
                          ? "border-blue-500/50"
                          : "border-gray-800"
                      }`}
                    >
                      <p className="text-gray-700 text-xs">Drop here</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Candidate Detail Modal — wider */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between mb-5">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-bold text-white">
                    {selected.name}
                  </h2>
                  {selected.aiScore >= 85 && (
                    <span className="bg-orange-500/20 border border-orange-500/30 text-orange-300 text-xs px-2 py-0.5 rounded-full">
                      🔥 Top Match
                    </span>
                  )}
                </div>
                <p className="text-gray-400 text-sm mt-0.5">{selected.role}</p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-gray-500 hover:text-white transition text-xl shrink-0 ml-4"
              >
                ✕
              </button>
            </div>

            {/* Score + Status row */}
            <div className="flex items-center gap-4 mb-5">
              <div
                className={`text-4xl font-bold ${
                  selected.aiScore >= 70
                    ? "text-green-400"
                    : selected.aiScore >= 50
                      ? "text-yellow-400"
                      : "text-red-400"
                }`}
              >
                {selected.aiScore}/100
              </div>
              <span
                className={`text-xs px-3 py-1.5 rounded-full border font-medium ${STATUS_COLORS[selected.status]}`}
              >
                {selected.status}
              </span>
              <div className="ml-auto">
                <select
                  value={selected.status}
                  disabled={updating === selected.id}
                  onChange={(e) => updateStatus(selected.id, e.target.value)}
                  className="bg-gray-800 border border-gray-700 text-gray-300 text-xs rounded-lg px-3 py-2 focus:outline-none"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* AI Summary */}
            {selected.aiSummary && (
              <div className="bg-gray-800 rounded-xl p-4 mb-4">
                <p className="text-gray-400 text-xs font-semibold mb-2 uppercase tracking-wide">
                  AI Summary
                </p>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {selected.aiSummary}
                </p>
              </div>
            )}

            {/* Skills */}
            {selected.skills?.length > 0 && (
              <div className="mb-5">
                <p className="text-gray-400 text-xs font-semibold mb-2 uppercase tracking-wide">
                  Skills Detected
                </p>
                <div className="flex flex-wrap gap-2">
                  {selected.skills.map((s: string) => (
                    <span
                      key={s}
                      className="bg-gray-800 text-gray-300 text-xs px-3 py-1.5 rounded-full border border-gray-700"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* AI Interview Questions */}
            <InterviewQuestions candidate={selected} />

            {/* Smart Action Buttons */}
            {actions && (actions.primary || actions.secondary) && (
              <div
                className={`grid gap-2 mt-2 ${actions.primary && actions.secondary ? "grid-cols-2" : "grid-cols-1"}`}
              >
                {actions.primary && (
                  <button
                    onClick={() =>
                      updateStatus(
                        selected.id,
                        STATUS_NEXT[selected.status] || "Hired",
                      )
                    }
                    disabled={updating === selected.id}
                    className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition text-sm"
                  >
                    → {actions.primary}
                  </button>
                )}
                {actions.secondary && (
                  <button
                    onClick={() =>
                      updateStatus(selected.id, STATUS_DECLINE[selected.status])
                    }
                    disabled={updating === selected.id}
                    className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-medium py-3 rounded-xl transition text-sm"
                  >
                    ✕ {actions.secondary}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
