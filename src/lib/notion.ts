import { Client } from '@notionhq/client'

export const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

export const DATABASE_ID = process.env.NOTION_DATABASE_ID!

export async function createCandidate(data: {
  name: string
  role: string
  aiScore: number
  aiSummary: string
  skills: string[]
  resumeLink?: string
}) {
  return await notion.pages.create({
    parent: { database_id: DATABASE_ID },
    properties: {
      Name: { title: [{ text: { content: data.name } }] },
      Role: { select: { name: data.role } },
      Status: { select: { name: 'Applied' } },
      'AI Score': { number: data.aiScore },
      'AI Summary': { rich_text: [{ text: { content: data.aiSummary } }] },
      Skills: { multi_select: data.skills.map(s => ({ name: s })) },
      'Resume Link': data.resumeLink ? { url: data.resumeLink } : { url: null },
      'Applied At': { date: { start: new Date().toISOString() } },
    },
  })
}

export async function getCandidates() {
  const response = await notion.databases.query({
    database_id: DATABASE_ID,
    sorts: [{ timestamp: 'created_time', direction: 'descending' }],
  })
  return response.results
}

export async function updateCandidateStatus(pageId: string, status: string) {
  return await notion.pages.update({
    page_id: pageId,
    properties: {
      Status: { select: { name: status } },
    },
  })
}