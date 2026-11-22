// Em desenvolvimento o Vite conversa com o backend local. Na imagem publicada,
// o Nginx encaminha /api para o container Spring Boot, mantendo tudo no mesmo domínio.
const configuredApi = import.meta.env.VITE_API_URL?.trim();
export const API = (configuredApi || (import.meta.env.DEV ? 'http://localhost:8080/api' : '/api'))
    .replace(/\/+$/, '');

export async function api(path, options = {}) {
    const session = JSON.parse(localStorage.getItem('edulead-session') || 'null');
    const authHeader = session?.token ? { 'Authorization': `Bearer ${session.token}` } : {};
    const isFormData = options.body instanceof FormData;

    const response = await fetch(API + path, {
        headers: {
            ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
            ...authHeader
        },
        ...options
    });

    if (!response.ok) {
        let message = 'Não foi possível concluir a ação.';
        try {
            message = (await response.json()).message || message;
        } catch {}

        throw new Error(message);
    }

    return response.status === 204 ? null : response.json();
}
