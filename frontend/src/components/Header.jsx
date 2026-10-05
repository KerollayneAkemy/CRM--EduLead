import React from 'react';
import logoImg from '../img/EduLead - Logo.jpeg';

// Barra superior fixa da aplicação. Exibe o logotipo da instituição, botão para abrir/fechar
//  o menu mobile, dados do usuário logado (com as iniciais calculadas dinamicamente) e botão "Sair".

export default function Header({ logout, onToggleMenu, onProfile, onHome, user }) { //O componente recebe informações e funções do componente pai
    const initials = (user?.nome || 'Usuário') // Para aparecer somente as iniciais no avatar , por isso precisa fazer isso :
        .trim() // Remove espaços desnecessários do começo e do final.
        .split(/\s+/) // representa espaços em branco
        .slice(0, 2) // Pega somente os dois primeiros elementos
        .map(word => word[0]) // percorre cada elemento do array
        .join('') // junta os elementos.
        .toUpperCase(); // Transforma tudo em letras maiúsculas.

    return (
        <header>
            <button className="menu-toggle" onClick={onToggleMenu} title="Menu">
                ☰
            </button>
            <div
                className="brand-logo-container"
                onClick={onHome}
                style={{ cursor: 'pointer' }}
                title="Ir para a Dashboard"
            >
                <img src={logoImg} alt="EduLead" className="header-logo-img" />
                <b>EduLead</b>
            </div>
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
