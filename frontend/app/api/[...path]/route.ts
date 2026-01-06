import { NextRequest, NextResponse } from 'next/server'

type RouteContext = {
    params: Promise<{ path: string[] }>
}

export async function GET(request: NextRequest, context: RouteContext) {
    return proxyRequest(request, 'GET', context)
}

export async function POST(request: NextRequest, context: RouteContext) {
    return proxyRequest(request, 'POST', context)
}

export async function PUT(request: NextRequest, context: RouteContext) {
    return proxyRequest(request, 'PUT', context)
}

export async function DELETE(request: NextRequest, context: RouteContext) {
    return proxyRequest(request, 'DELETE', context)
}

export async function PATCH(request: NextRequest, context: RouteContext) {
    return proxyRequest(request, 'PATCH', context)
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    })
}

async function proxyRequest(request: NextRequest, method: string, context: RouteContext) {
    const { path } = await context.params
    const pathString = Array.isArray(path) ? path.join('/') : path
    const backendUrl = `http://127.0.0.1:5000/api/${pathString}${request.nextUrl.search}`

    console.log(`[Proxy] ${method} ${request.nextUrl.pathname} -> ${backendUrl}`)

    try {
        const headers: Record<string, string> = {}
        request.headers.forEach((value, key) => {
            if (!['host', 'connection', 'content-length'].includes(key.toLowerCase())) {
                headers[key] = value
            }
        })

        const options: RequestInit = {
            method,
            headers,
        }

        if (method !== 'GET' && method !== 'HEAD') {
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
                'Content-Type': response.headers.get('Content-Type') || 'application/json',
            },
        })
    } catch (error) {
        console.error('[Proxy] Error:', error)
        return NextResponse.json(
            { error: 'Proxy request failed', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        )
    }
}
