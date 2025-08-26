import { QueryClient, DefaultOptions } from '@tanstack/react-query'

const queryConfig: DefaultOptions = {
  queries: {
    // Cache por 5 minutos por padrão
    staleTime: 1000 * 60 * 5,
    // Manter em cache por 10 minutos
    gcTime: 1000 * 60 * 10,
    // Retry em caso de erro
    retry: (failureCount, error: any) => {
      if (error?.status === 401 || error?.status === 403) {
        return false
      }
      return failureCount < 2
    },
    // Background refetch
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
  },
  mutations: {
    retry: false,
  },
}

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: queryConfig,
  })
}

let clientQueryClientSingleton: QueryClient | undefined = undefined

export function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: sempre criar novo cliente
    return createQueryClient()
  } else {
    // Client: usar singleton
    if (!clientQueryClientSingleton) {
      clientQueryClientSingleton = createQueryClient()
    }
    return clientQueryClientSingleton
  }
}