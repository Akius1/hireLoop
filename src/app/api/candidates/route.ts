/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { getCandidates, updateCandidateStatus } from '@/lib/notion'

export async function GET() {
  try {
    const pages = await getCandidates()
    const candidates = pages.map((page: any) => ({
      id: page.id,
      name: page.properties?.Name?.title?.[0]?.text?.content || 'Unknown',
      role: page.properties?.Role?.select?.name || '',
      status: page.properties?.Status?.select?.name || 'Applied',
      aiScore: page.properties?.['AI Score']?.number || 0,
      aiSummary: page.properties?.['AI Summary']?.rich_text?.[0]?.text?.content || '',
      skills: page.properties?.Skills?.multi_select?.map((s: any) => s.name) || [],
    }))
    return NextResponse.json({ candidates })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, status } = await req.json()
    await updateCandidateStatus(id, status)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}