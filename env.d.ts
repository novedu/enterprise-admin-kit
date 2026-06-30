/// <reference types="vite/client" />

declare module '*?worker' {
  const workerConstructor: {
    new (): Worker
  }
  export default workerConstructor
}

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    titleKey?: string
    icon?: string
    public?: boolean
  }
}

declare global {
  interface Window {
    MonacoEnvironment?: {
      getWorker(workerId: string, label: string): Worker
    }
  }

  interface WorkerGlobalScope {
    MonacoEnvironment?: {
      getWorker(workerId: string, label: string): Worker
    }
  }
}

export {}
