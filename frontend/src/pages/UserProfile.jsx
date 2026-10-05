import React, { useEffect, useState } from 'react';
import { api } from '../api';
// é o componente responsável pela página “Meu perfil” do EduLead.
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

    if (!profile) return <p style={{ padding: '20px' }}>Carregando perfil...</p>;

    const initials = (profile.nome || 'Usuário')
        .trim() // remove espaços
        .split(/\s+/) // divide as palavras
        .slice(0, 2) // pega as 2 primeiras letra
        .map(w => w[0]) // percorre
        .join('') // junta
        .toUpperCase(); // coloca maisculo

    return (
        <div className="profile-page-container">
            <div className="title-row">
                <div>
                    <p className="eyebrow">CONFIGURAÇÕES DE CONTA</p>
                    <h1>Meu perfil</h1>
                    <p>Gerencie suas informações de acesso e credenciais.</p>
                </div>
            </div>

            <div className="profile-card">
                <div className="profile-card-header">
                    <div className="profile-card-avatar">
                        {initials}
                    </div>
                    <div>
                        <h2>{profile.nome}</h2>
                        <span className="profile-role-tag">{profile.cargo || 'Usuário'}</span>
                    </div>
                </div>

                <form onSubmit={submit} className="profile-form">
                    <div className="profile-section-card">
                        <div className="profile-section-header">
                            <div className="profile-section-icon">👤</div>
                            <div>
                                <h3>Informações da conta</h3>
                                <small>Dados cadastrais do usuário no sistema</small>
                            </div>
                        </div>
                        <div className="profile-section-body">
                            <label>
                                Nome completo
                                <input value={profile.nome || ''} disabled style={{ background: '#f8fafc', color: '#64748b' }} />
                            </label>

                            <label>
                                Cargo / Perfil
                                <input value={profile.cargo || ''} disabled style={{ background: '#f8fafc', color: '#64748b' }} />
                            </label>

                            <label className="full">
                                E-mail de acesso
                                <input
                                    type="email"
                                    value={form.email || ''}
                                    onChange={e => setForm({ ...form, email: e.target.value })}
                                    required
                                />
                            </label>
                        </div>
                    </div>

                    <div className="profile-section-card">
                        <div className="profile-section-header">
                            <div className="profile-section-icon">🔒</div>
                            <div>
                                <h3>Segurança</h3>
                                <small>Credenciais e senha de acesso</small>
                            </div>
                        </div>
                        <div className="profile-section-body">
                            <label className="full">
                                Nova senha
                                <input
                                    type="password"
                                    value={form.senha || ''}
                                    onChange={e => setForm({ ...form, senha: e.target.value })}
                                    placeholder="Deixe em branco para manter a senha atual"
                                />
                            </label>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button className="btn-primary-large" disabled={busy}>
                            {busy ? 'Salvando...' : 'Salvar alterações'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
