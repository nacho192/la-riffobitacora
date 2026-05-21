import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const secret = searchParams.get('secret')

  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json(
      { ok: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }

  return NextResponse.json({
    ok: true,
    message: 'Monthly backup route is working'
  })
}