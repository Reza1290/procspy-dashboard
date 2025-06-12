import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
 
const protectedRoutes = ['/dashboard']
const publicRoutes = ['/login', '/signup', '/']
 
export default async function middleware(req) {
  const path = req.nextUrl.pathname
  const isProtectedRoute = protectedRoutes.includes(path)
  const isPublicRoute = publicRoutes.includes(path)
 
  const cookie = (await cookies()).get('access_token')?.value

  if ((isProtectedRoute || path.startsWith(protectedRoutes[0])) && !cookie) {
    return NextResponse.redirect(new URL('/login', req.nextUrl))
  }
 
  if (
    isPublicRoute && cookie &&
    !req.nextUrl.pathname.startsWith('/dashboard')
  ) {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl))
  }
 
  return NextResponse.next()
}
 
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}