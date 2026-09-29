import React from 'react';

export default function RecordCard({
    x,
    type,
    openMenuId,
    setOpenMenuId,
    setEditingCourse,
    archiveCourse,
    removeCourse,
    toggleUserActive
}) {
    return (
        <article className="record-card">
            <span className="record-avatar">
                {x.nome?.slice(0, 1)}
            </span>

            <div className="record-details">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <b>{x.nome}</b>
                    {type === 'Cursos' && (
                        <span className="badge-active-status">Ativo</span>
                    )}
                </div>
                <small>
                    {x.email ||
                        x.descricao ||
                        x.cargo ||
                        'Sem descrição'}
                </small>
            </div>

            {type === 'Cursos' ? (
                <div className="record-actions-wrapper">
                    <button
                        type="button"
                        className="btn-menu-trigger"
                        onClick={() =>
                            setOpenMenuId(openMenuId === x.id ? null : x.id)
                        }
                        title="Opções"
                    >
                        ⋮
                    </button>
                    {openMenuId === x.id && (
                        <div className="record-dropdown-menu">
                            <button
                                type="button"
                                className="dropdown-item"
                                onClick={() => {
                                    setOpenMenuId(null);
                                    setEditingCourse({
                                        id: x.id,
                                        nome: x.nome,
                                        descricao: x.descricao || '',
                                        ativo: x.ativo
                                    });
                                }}
                            >
                                ✏️ Editar
                            </button>
                            <button
                                type="button"
                                className="dropdown-item"
                                onClick={() => {
                                    setOpenMenuId(null);
                                    archiveCourse(x);
                                }}
                            >
                                📦 Arquivar
                            </button>
                            <button
                                type="button"
                                className="dropdown-item danger"
                                onClick={() => {
                                    setOpenMenuId(null);
                                    removeCourse(x);
                                }}
                            >
                                🗑️ Excluir
                            </button>
                        </div>
                    )}
                </div>
            ) : type === 'Usuários' ? (
                <div className="record-user-actions">
                    <em>
                        {x.ativo === false
                            ? 'Inativo'
                            : 'Ativo'}
                    </em>
                    <button
                        type="button"
                        className={
                            x.ativo === false
                                ? 'activate-user'
                                : 'deactivate-user'
                        }
                        onClick={() => toggleUserActive(x)}
                    >
                        {x.ativo === false
                            ? 'Ativar'
                            : 'Desativar'}
                    </button>
                </div>
            ) : (
                <em>
                    {x.ativo === false
                        ? 'Inativo'
                        : 'Ativo'}
                </em>
            )}
        </article>
    );
}
