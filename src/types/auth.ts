export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials extends LoginCredentials {
  fullName?: string
  options?: {
    data: {
      full_name?: string
      [key: string]: any
    }
    emailRedirectTo?: string
  }
}

export interface AuthUser {
  id: string
  email?: string
  app_metadata: {
    provider?: string
    [key: string]: any
  }
  user_metadata: {
    [key: string]: any
  }
  aud: string
  created_at: string
}

export interface AuthSession {
  access_token: string
  token_type: string
  expires_in: number
  expires_at?: number
  refresh_token: string
  user: AuthUser
}
