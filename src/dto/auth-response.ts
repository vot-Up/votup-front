export interface AuthResponse {
    token: Token;
}

interface Token {
    refresh: string;
    access: string;
}
