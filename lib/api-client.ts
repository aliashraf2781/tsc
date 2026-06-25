export async function apiCall<T>(
  path: string, 
  options: RequestInit = {}
): Promise<{data: T|null, error: string|null, status: number}> {
  try {
    // Ensure cookies are sent with requests by default. Allow callers to
    // override `credentials` in the `options` if needed.
    const mergedOptions: RequestInit = { credentials: 'include', ...options }
    const res = await fetch(path, mergedOptions)

    // Do not perform aggressive client-side logout/redirect here. Return
    // the 401 to callers so they can decide how to handle session expiry.
    if (res.status === 401) {
      return { data: null, error: 'UNAUTHORIZED', status: 401 }
    }

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      return { 
        data: null, 
        error: errData.message || `Request failed with status ${res.status}`, 
        status: res.status 
      }
    }

    const data = await res.json() as T
    return { data, error: null, status: res.status }
  } catch (err) {
    return { 
      data: null, 
      error: err instanceof Error ? err.message : 'Network error', 
      status: 0 
    }
  }
}

export const ticketsApi = {
  list: async (params?: { per_page?: number, page?: number, status?: string }) => {
    const query = new URLSearchParams()
    if (params?.per_page) query.append('per_page', String(params.per_page))
    if (params?.page) query.append('page', String(params.page))
    if (params?.status) query.append('status', params.status)
    const queryString = query.toString()
    return apiCall<any>(`/api/proxy/tickets${queryString ? `?${queryString}` : ''}`)
  },
  show: async (id: number) => {
    return apiCall<any>(`/api/proxy/tickets/${id}`)
  },
  create: async (fd: FormData) => {
    return apiCall<any>('/api/proxy/tickets', { method: 'POST', body: fd })
  },
  reply: async (id: number, fd: FormData) => {
    return apiCall<any>(`/api/proxy/tickets/${id}/reply`, { method: 'POST', body: fd })
  },
  updateStatus: async (id: number, status: string) => {
    const fd = new FormData()
    fd.append('status', status)
    return apiCall<any>(`/api/proxy/tickets/${id}/status`, { method: 'POST', body: fd })
  }
}

export const profileApi = {
  get: async () => {
    return apiCall<any>('/api/auth/profile')
  },
  update: async (fd: FormData) => {
    return apiCall<any>('/api/proxy/auth/profile', { method: 'POST', body: fd })
  },
  uploadAvatar: async (fd: FormData) => {
    return apiCall<any>('/api/proxy/auth/profile/avatar', { method: 'POST', body: fd })
  },
  deleteAvatar: async () => {
    return apiCall<any>('/api/proxy/auth/profile/avatar', { method: 'DELETE' })
  },
  updatePassword: async (fd: FormData) => {
    return apiCall<any>('/api/proxy/auth/profile/password', { method: 'POST', body: fd })
  }
}
