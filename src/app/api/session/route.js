import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const accessToken = (await cookies()).get('access_token')?.value
  return NextResponse.json({ token:accessToken })
}
