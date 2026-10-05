import React from 'react';
//Menu lateral de navegação. Filtra as opções visíveis com base no cargo do usuário 
// (exibe "Cursos", "Cursos arquivados" e "Usuários" apenas se isManager for verdadeiro).
// Verificação se o usuário é gestor ou não

export default function Sidebar({ page, nav, isManager, isOpen, onClose }) {
    const handleNav = p => { // p = página. serve como uma função intermediária para cuidar da navegação
        nav(p);
        if (onClose) onClose(); // Se existir onClose executa(útil no menu mobile)
    };

    return ( // <> serve para agrupar vários elementos sem criar um div extra no HTML. aide = conteúdo lateral
        <> 
            {isOpen && <div className="sidebar-backdrop" onClick={onClose} />} 
            <aside className={isOpen ? 'open' : ''}> 
                {[
                    'Dashboard',
                    'Funil',
                    'Interessados',
                    'Novo interessado',
                    'Tarefas'
                ].concat(isManager ? ['Cursos', 'Cursos arquivados', 'Usuários'] : []).map(x => ( // juntar arrays
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
