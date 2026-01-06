import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    const backendUrl = 'http://127.0.0.1:5000/api/auth/login'

    console.log('[Auth Proxy] POST /api/auth/login ->', backendUrl)

    try {
        const body = await request.text()

        const response = await fetch(backendUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body,
        })

        const data = await response.text()

        console.log('[Auth Proxy] Response status:', response.status)

        return new NextResponse(data, {
            status: response.status,
            headers: {
                'Content-Type': 'application/json',
            },
        })
    } catch (error) {
        console.error('[Auth Proxy] Error:', error)
        return NextResponse.json(
            { error: 'Proxy failed', details: error instanceof Error ? error.message : 'Unknown' },
            { status: 500 }
        )
    }
}
