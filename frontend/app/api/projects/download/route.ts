import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    const backendUrl = 'http://127.0.0.1:5000/api/projects/download'

    console.log('[Projects Proxy] POST /api/projects/download')

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

        // For blob responses (ZIP files)
        const blob = await response.blob()

        return new NextResponse(blob, {
            status: response.status,
            headers: {
                'Content-Type': response.headers.get('Content-Type') || 'application/zip',
                'Content-Disposition': response.headers.get('Content-Disposition') || 'attachment; filename="project.zip"',
            },
        })
    } catch (error) {
        console.error('[Projects Proxy] Error:', error)
        return NextResponse.json(
            { error: 'Download proxy failed' },
            { status: 500 }
        )
    }
}
