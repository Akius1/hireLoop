import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
      <div className="max-w-2xl text-center">
        <div className="inline-block bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm px-4 py-2 rounded-full mb-6">
          Built with Notion MCP × Claude AI
        </div>
        <h1 className="text-5xl font-bold text-white mb-4">HireLoop</h1>
        <p className="text-gray-400 text-xl mb-4">
          24/7 AI-powered hiring pipeline. Claude screens every resume instantly
          and pushes candidates into your Notion workspace — humans only decide
          what matters.
        </p>
        <p className="text-gray-500 text-sm mb-10">
          Apply → Claude AI screens → Notion auto-updates → Recruiter approves
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/apply"
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-3 rounded-xl transition"
          >
            Apply as Candidate →
          </Link>
          <Link
            href="/dashboard"
            className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 font-semibold px-8 py-3 rounded-xl transition"
          >
            Recruiter Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
