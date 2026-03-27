import { NextRequest, NextResponse } from 'next/server'
import { extractText } from 'unpdf'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

    const buffer = new Uint8Array(await file.arrayBuffer())
    const { text } = await extractText(buffer, { mergePages: true })

    return NextResponse.json({ text: text.trim() })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to parse PDF' }, { status: 500 })
  }
}
