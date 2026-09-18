import React from 'react';

export default function Header({ logout, onToggleMenu, onProfile, user }) {
    const initials = (user?.nome || 'Usuário')
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(word => word[0])
        .join('')
        .toUpperCase();

    return (
        <header>
            <button className="menu-toggle" onClick={onToggleMenu} title="Menu">
                ☰
            </button>
            <b>EduLead</b>
            <span>CRM para captação de alunos</span>
            <div className="profile-menu">
                <button className="profile-action" onClick={onProfile}>
                    <span className="profile-avatar" aria-hidden="true">
                        {initials}
                    </span>
                    <span>
                        <b>Meu perfil</b>
                        <small>{user?.nome || 'Usuário'}</small>
                    </span>
                </button>
                <button className="logout" onClick={logout}>
                    Sair
                </button>
            </div>
        </header>
    );
}
