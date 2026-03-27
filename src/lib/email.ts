import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendScreeningEmail({
  candidateName,
  candidateEmail,
  role,
  score,
  summary,
  skills,
}: {
  candidateName: string
  candidateEmail: string
  role: string
  score: number
  summary: string
  skills: string[]
}) {
  const scoreColor = score >= 70 ? '#22c55e' : score >= 50 ? '#eab308' : '#ef4444'
  const topMatch = score >= 85

  await resend.emails.send({
    from: 'HireLoop <onboarding@resend.dev>',
    to: candidateEmail,
    subject: `Your HireLoop application for ${role} has been received`,
    html: `
      <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; background: #0f172a; color: #e2e8f0; padding: 32px; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #3b82f6; font-size: 24px; margin: 0;">HireLoop</h1>
          <p style="color: #64748b; font-size: 13px; margin: 4px 0 0;">AI-Powered Hiring Pipeline</p>
        </div>
        <h2 style="font-size: 18px; color: #f1f5f9; margin-bottom: 8px;">Hi ${candidateName}! 👋</h2>
        <p style="color: #94a3b8; line-height: 1.6; margin-bottom: 24px;">
          Your application for <strong style="color: #e2e8f0;">${role}</strong> has been received and screened by our AI system.
        </p>
        <div style="background: #1e293b; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
          <div style="font-size: 48px; font-weight: bold; color: ${scoreColor};">${score}</div>
          <div style="color: #64748b; font-size: 13px; margin-top: 4px;">AI Match Score</div>
          ${topMatch ? '<div style="margin-top: 8px; display: inline-block; background: rgba(249,115,22,0.2); color: #fb923c; font-size: 12px; padding: 4px 12px; border-radius: 999px; border: 1px solid rgba(249,115,22,0.3);">🔥 Top Match</div>' : ''}
        </div>
        <div style="background: #1e293b; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
          <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0;">${summary}</p>
        </div>
        <div style="margin-bottom: 24px;">
          <p style="color: #64748b; font-size: 12px; margin-bottom: 8px;">SKILLS DETECTED</p>
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            ${skills.map(s => `<span style="background: #1e293b; color: #94a3b8; font-size: 12px; padding: 4px 12px; border-radius: 999px; border: 1px solid #334155;">${s}</span>`).join('')}
          </div>
        </div>
        <p style="color: #64748b; font-size: 13px; line-height: 1.6;">
          Our recruitment team will review your application and be in touch if you progress to the next stage. 
          This usually takes 2–5 business days.
        </p>
        <div style="border-top: 1px solid #1e293b; margin-top: 24px; padding-top: 16px; text-align: center;">
          <p style="color: #475569; font-size: 12px; margin: 0;">Powered by HireLoop × Claude AI × Notion</p>
        </div>
      </div>
    `
  })
}