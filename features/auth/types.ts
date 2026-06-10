export interface AuthCredentials { email: string; password: string }
export interface SignUpData extends AuthCredentials { name: string }
export interface AuthSession { user: { id: string; email: string } | null; isLoading: boolean }
