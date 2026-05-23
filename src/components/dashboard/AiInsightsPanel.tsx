interface AiInsight {
  type: "role" | "resume" | "company";
  message: string;
}

interface AiInsightsPanelProps {
  insights: AiInsight[];
}

/** Icon and color config per insight type */
const INSIGHT_CONFIG: Record<
  AiInsight["type"],
  { icon: string; bg: string; border: string; label: string }
> = {
  role: {
    icon: "🎯",
    bg: "bg-blue-50",
    border: "border-blue-200",
    label: "Role Trend",
  },
  resume: {
    icon: "📄",
    bg: "bg-amber-50",
    border: "border-amber-200",
    label: "Resume Tip",
  },
  company: {
    icon: "🏢",
    bg: "bg-purple-50",
    border: "border-purple-200",
    label: "Company Insight",
  },
};

/**
 * AI Insights panel — the "smart" section of the dashboard.
 * Displays rule-based (or LLM-powered) insights about the user's job search.
 */
export default function AiInsightsPanel({ insights }: AiInsightsPanelProps) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <span className="text-2xl">🧠</span>
        <div>
          <h2 className="text-base font-semibold text-zinc-900">AI Insights</h2>
          <p className="text-xs text-zinc-500">
            Personalized analysis of your job search activity
          </p>
        </div>
      </div>

      {/* Insight cards */}
      {insights.length === 0 ? (
        <p className="text-sm text-zinc-400 text-center py-6">
          Add more jobs to unlock AI insights.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {insights.map((insight, idx) => {
            const config = INSIGHT_CONFIG[insight.type];
            return (
              <div
                key={idx}
                className={`rounded-lg border ${config.border} ${config.bg} px-4 py-3`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base">{config.icon}</span>
                  <span className="text-xs font-semibold text-zinc-600 uppercase tracking-wide">
                    {config.label}
                  </span>
                </div>
                <p className="text-sm text-zinc-700 leading-snug">
                  {insight.message}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
