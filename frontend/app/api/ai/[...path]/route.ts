import { NextRequest, NextResponse } from 'next/server'

type RouteContext = {
    params: Promise<{ path: string[] }>
}

async function proxyToBackend(request: NextRequest, context: RouteContext, method: string) {
    const { path } = await context.params
    const pathString = Array.isArray(path) ? path.join('/') : path
    const backendUrl = `http://127.0.0.1:5000/api/ai/${pathString}${request.nextUrl.search}`

    console.log(`[AI Proxy] ${method} -> ${backendUrl}`)

    try {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        }

        const authHeader = request.headers.get('Authorization')
        if (authHeader) {
            headers['Authorization'] = authHeader
        }

        const options: RequestInit = {
            method,
            headers,
        }

        if (method !== 'GET') {
            const body = await request.text()
            if (body) {
                options.body = body
            }
        }

        const response = await fetch(backendUrl, options)
        const data = await response.text()

        return new NextResponse(data, {
            status: response.status,
            headers: {
                'Content-Type': 'application/json',
            },
        })
    } catch (error) {
        console.error('[AI Proxy] Error:', error)
        return NextResponse.json(
            { error: 'Proxy failed' },
            { status: 500 }
        )
    }
}

export async function GET(request: NextRequest, context: RouteContext) {
    return proxyToBackend(request, context, 'GET')
}

export async function POST(request: NextRequest, context: RouteContext) {
    return proxyToBackend(request, context, 'POST')
}

export async function OPTIONS() {
    return new NextResponse(null, { status: 200 })
}
