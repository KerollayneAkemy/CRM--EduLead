// função central para fazer as requisições do frontend para o backend do EduLead.
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
            m = (await r.json()).message || m; // Aqui ele tenta ler a resposta do backend como JSON.
        } catch { }

        throw Error(m);
    }

    return r.status === 204 ? null : r.json(); // A requisição deu certo, mas não existe conteúdo para retornar.
}
// Esse arquivo centraliza as requisições da aplicação para a API. 
// Ele monta a URL, recupera o token de autenticação salvo na sessão, envia esse token no header e também trata 
// possíveis erros e respostas do backend