declare module 'markdown-it'

declare module '@mocks/handlers.js' {
  export function handleMockRequest(input: {
    method: string
    pathname: string
    searchParams: URLSearchParams
    body: Record<string, unknown>
  }): unknown
}
