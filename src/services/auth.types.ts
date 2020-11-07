export enum AuthProvider {
    Email,
    Facebook,
    Google,
    Twitter
}

//usado apenas para entradas no método auth.service.ts
export interface Cliente {
    name?: string;
    email: string;
    senha: string;
}

export interface AuthOptions {
    isSignIn: boolean;
    provider: AuthProvider;
    cliente: Cliente;
}