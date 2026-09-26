import React from 'react';

export default function Sidebar({ page, nav, isManager, isOpen, onClose }) {
    const handleNav = p => {
        nav(p);
        if (onClose) onClose();
    };

    return (
        <>
            {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}
            <aside className={isOpen ? 'open' : ''}>
                {[
                    'Dashboard',
                    'Funil',
                    'Interessados',
                    'Novo interessado',
                    'Tarefas'
                ].concat(isManager ? ['Cursos', 'Cursos arquivados', 'Usuários'] : []).map(x => (
                    <button
                        key={x}
                        className={page === x ? 'on' : ''}
                        onClick={() => handleNav(x)}
                    >
                        {x}
                    </button>
                ))}
            </aside>
        </>
    );
}
