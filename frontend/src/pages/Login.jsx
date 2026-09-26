import React, { useState } from 'react';
import { api } from '../api';

export default function Login({ onLogin }) {
    const [f, setF] = useState({
        email: 'ana@edulead.com',
        senha: '123456'
    });
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    async function submit(e) {
        e.preventDefault();
        setBusy(true);
        setError('');

        try {
            const result = await api('/auth/login', {
                method: 'POST',
                body: JSON.stringify(f)
            });

            localStorage.setItem('edulead-session', JSON.stringify(result));
            onLogin(result);
        } catch (e) {
            setError(e.message);
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="login">
            <form onSubmit={submit}>
                <h1>EduLead</h1>
                <p>Entre para acompanhar suas captações.</p>

                <label>
                    E-mail
                    <input
                        type="email"
                        value={f.email}
                        onChange={e => setF({ ...f, email: e.target.value })}
                    />
                </label>

                <label>
                    Senha
                    <input
                        type="password"
                        value={f.senha}
                        onChange={e => setF({ ...f, senha: e.target.value })}
                    />
                </label>

                {error && <p className="error">{error}</p>}

                <button disabled={busy}>
                    {busy ? 'Entrando...' : 'Entrar'}
                </button>

                <small>Demo: ana@edulead.com · 123456</small>
            </form>
        </div>
    );
}
