export const API = 'http://localhost:8080/api';

export async function api(path, options = {}) {
    const session = JSON.parse(localStorage.getItem('edulead-session') || 'null');
    const authHeader = session?.token ? { 'Authorization': `Bearer ${session.token}` } : {};

    const r = await fetch(API + path, {
        headers: { 'Content-Type': 'application/json', ...authHeader },
        ...options
    });

    if (!r.ok) {
        let m = 'Não foi possível concluir a ação.';
        try {
            m = (await r.json()).message || m;
        } catch { }

        throw Error(m);
    }

    return r.status === 204 ? null : r.json();
}
