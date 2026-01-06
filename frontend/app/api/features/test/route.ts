import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    const backendUrl = 'http://127.0.0.1:5000/api/features/test'

    try {
        const body = await request.text()
        const authHeader = request.headers.get('Authorization')

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        }

        if (authHeader) {
            headers['Authorization'] = authHeader
        }

        const response = await fetch(backendUrl, {
            method: 'POST',
            headers,
            body,
        })

        const data = await response.text()

        return new NextResponse(data, {
            status: response.status,
            headers: {
                'Content-Type': 'application/json',
            },
        })
    } catch (error) {
        return NextResponse.json(
            { error: 'Test proxy failed' },
            { status: 500 }
        )
    }
}
