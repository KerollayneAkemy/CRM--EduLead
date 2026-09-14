import React from 'react';

export default function Header({ logout, onToggleMenu }) {
    return (
        <header>
            <button className="menu-toggle" onClick={onToggleMenu} title="Menu">
                ☰
            </button>
            <b>EduLead</b>
            <span>CRM para captação de alunos</span>
            <button className="logout" onClick={logout}>
                Sair
            </button>
        </header>
    );
}
