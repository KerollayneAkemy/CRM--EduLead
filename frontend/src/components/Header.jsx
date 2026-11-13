import logoImg from '../img/EduLead - Logo.jpeg';

export default function Header({ logout, onToggleMenu, onProfile, onHome, onAssistant, user }) {
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
            <div
                className="brand-logo-container"
                onClick={onHome}
                style={{ cursor: 'pointer' }}
                title="Ir para a Dashboard"
            >
                <img src={logoImg} alt="EduLead" className="header-logo-img" />
                <b>EduLead</b>
            </div>
            <span className="header-subtitle">CRM para captação de alunos</span>
            <div className="header-tools">
                <button className="assistant-action" onClick={onAssistant} title="Abrir assistente interno">
                    <span aria-hidden="true">✦</span>
                    <span>Assistente</span>
                </button>
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
            </div>
        </header>
    );
}
