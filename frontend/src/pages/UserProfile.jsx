import React, { useEffect, useState } from 'react';
import { api } from '../api';

export default function UserProfile({ notice }) {
    const [profile, setProfile] = useState(null);
    const [form, setForm] = useState({});
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        api('/perfil')
            .then(data => {
                setProfile(data);
                setForm({ email: data.email, senha: '' });
            })
            .catch(error => notice(error.message));
    }, []);

    async function submit(event) {
        event.preventDefault();
        setBusy(true);
        try {
            const updated = await api('/perfil', {
                method: 'PATCH',
                body: JSON.stringify(form)
            });
            setProfile(updated);
            setForm({ email: updated.email, senha: '' });
            notice('Perfil atualizado com sucesso.');
        } catch (error) {
            notice(error.message);
        } finally {
            setBusy(false);
        }
    }

    if (!profile) return <p>Carregando perfil...</p>;

    return (
        <form onSubmit={submit}>
            <h1>Meu perfil</h1>
            <p className="full">Atualize seu e-mail ou defina uma nova senha.</p>
            <label>
                Nome
                <input value={profile.nome || ''} disabled />
            </label>
            <label>
                Perfil
                <input value={profile.cargo || ''} disabled />
            </label>
            <label className="full">
                E-mail
                <input type="email" value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </label>
            <label className="full">
                Nova senha
                <input type="password" value={form.senha || ''} onChange={e => setForm({ ...form, senha: e.target.value })} placeholder="Deixe em branco para manter a senha atual" />
            </label>
            <button disabled={busy}>{busy ? 'Salvando...' : 'Salvar alterações'}</button>
        </form>
    );
}
