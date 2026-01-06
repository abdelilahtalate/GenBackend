import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    const backendUrl = 'http://127.0.0.1:5000/api/auth/register'

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

        return new NextResponse(data, {
            status: response.status,
            headers: {
                'Content-Type': 'application/json',
            },
        })
    } catch (error) {
        return NextResponse.json(
            { error: 'Proxy failed' },
            { status: 500 }
        )
    }
}
