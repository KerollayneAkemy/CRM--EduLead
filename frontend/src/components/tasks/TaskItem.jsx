import React from 'react';
// representa cada tarefa individualmente na tela. Ele mostra o título, status, prazo, descrição e os botões de Concluir e Excluir.
export default function TaskItem({ t, done, setTaskToDelete }) {
    const isDone = t.status === 'CONCLUIDA' || t.status === 'CONCLUÍDA';

    return (
        <article className={`task-card ${isDone ? 'task-done' : ''}`} key={t.id}>
            <div className="task-info">
                <b>{t.titulo}</b>

                <div className="task-details">
                    <span className={`badge-status ${isDone ? 'concluida' : 'pendente'}`}>
                        {t.status || 'PENDENTE'}
                    </span>

                    {t.prazo && <span>📅 Prazo: {t.prazo}</span>}

                    {t.descricao && <span>{t.descricao}</span>}
                </div>
            </div>

            <div className="task-actions-group">
                {!isDone && (
                    <button onClick={() => done(t.id)}>
                        ✓ Concluir
                    </button>
                )}

                <button
                    type="button"
                    className="btn-trash-task"
                    onClick={() => setTaskToDelete(t)}
                    title="Excluir tarefa"
                >
                    🗑️
                </button>
            </div>
        </article>
    );
}
