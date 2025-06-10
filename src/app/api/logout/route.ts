import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const response = NextResponse.json({ message: 'Logged out' })

  response.cookies.set('access_token', '', {
    path: '/',
    expires: new Date(0), 
    httpOnly: true,       
    secure: true,         
    sameSite: 'lax'       
  })

  return response
}
