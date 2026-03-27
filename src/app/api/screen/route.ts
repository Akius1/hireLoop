import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createCandidate } from '@/lib/notion'
import { sendScreeningEmail } from '@/lib/email'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { name, role, resumeText, email, linkedinUrl } = await req.json()
    const contentToScreen = resumeText || `LinkedIn/Portfolio: ${linkedinUrl}`

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `You are a senior recruiter. Analyze this candidate for the role of "${role}".

Candidate info:
${contentToScreen}

Respond ONLY with valid JSON, no markdown:
{
  "score": <number 0-100>,
  "summary": "<3 sentences max about fit for the role>",
  "skills": ["skill1", "skill2", "skill3", "skill4", "skill5"]
}`
      }]
    })

    const content = message.content[0]
    if (content.type !== 'text') throw new Error('Unexpected response')
    const cleaned = content.text.replace(/```json\n?|\n?```/g, '').trim()
    const result = JSON.parse(cleaned)

    await createCandidate({
      name,
      role,
      aiScore: result.score,
      aiSummary: result.summary,
      skills: result.skills,
    })

    if (email) {
      try {
        await sendScreeningEmail({
          candidateName: name,
          candidateEmail: email,
          role,
          score: result.score,
          summary: result.summary,
          skills: result.skills,
        })
      } catch (emailError) {
        console.error('Email failed (non-critical):', emailError)
      }
    }

    return NextResponse.json({ success: true, screening: result })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Screening failed' }, { status: 500 })
  }
}