
export default function Sidebar({ page, nav, isManager, isOpen, onClose }) {
    const operationItems = ['Dashboard', 'Funil', 'Interessados', 'Novo interessado', 'Tarefas'];
    const managementItems = ['Cursos', 'Cursos arquivados', 'Usuários'];
    const icons = {
        Dashboard: '▦', Funil: '⌁', Interessados: '◉', 'Novo interessado': '+',
        Tarefas: '✓', Cursos: '▤', 'Cursos arquivados': '□', Usuários: '◌'
    };

    const handleNav = pageName => {
        nav(pageName);
        if (onClose) onClose();
    };

    const renderItem = pageName => (
        <button key={pageName} className={page === pageName ? 'on' : ''} onClick={() => handleNav(pageName)}>
            <span className="sidebar-icon" aria-hidden="true">{icons[pageName]}</span>
            <span>{pageName}</span>
        </button>
    );

    return (
        <>
            {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}
            <aside className={isOpen ? 'open' : ''}>
                {operationItems.map(renderItem)}
                {isManager && <>
                    <p className="sidebar-section-label">GESTÃO</p>
                    {managementItems.map(renderItem)}
                </>}
            </aside>
        </>
    );
}
