import { NextResponse } from 'next/server'

// Temporarily disable admin middleware to debug routing issues
export async function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: [],
}