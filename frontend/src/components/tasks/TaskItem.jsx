
const priorities = { BAIXA: 'Baixa', NORMAL: 'Normal', ALTA: 'Alta' };

export default function TaskItem({ t, done, setTaskToDelete }) {
    const isDone = t.status === 'CONCLUIDA' || t.status === 'CONCLUÍDA';
    const priority = (t.prioridade || 'NORMAL').toUpperCase();
    const dueDate = t.prazo
        ? new Date(`${t.prazo}T12:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
        : null;

    return (
        <article className={`task-card ${isDone ? 'task-done' : ''} priority-${priority.toLowerCase()}`}>
            <div className="task-check" aria-hidden="true">{isDone ? '✓' : '○'}</div>
            <div className="task-info">
                <div className="task-title-line">
                    <b>{t.titulo}</b>
                    <span className={`task-priority ${priority.toLowerCase()}`}>{priorities[priority] || 'Normal'}</span>
                </div>
                <div className="task-details">
                    <span className={`badge-status ${isDone ? 'concluida' : 'pendente'}`}>{isDone ? 'Concluída' : 'Pendente'}</span>
                    {dueDate && <span className="task-deadline">◷ Prazo: {dueDate}</span>}
                    {t.interessado?.nome && <span className="task-lead">◉ {t.interessado.nome}</span>}
                </div>
                {t.descricao && <p className="task-description">{t.descricao}</p>}
            </div>

            <div className="task-actions-group">
                {!isDone && <button className="task-complete" onClick={() => done(t.id)}>✓ Concluir</button>}
                <button type="button" className="btn-trash-task" onClick={() => setTaskToDelete(t)} title="Excluir tarefa" aria-label={`Excluir tarefa ${t.titulo}`}>⌫</button>
            </div>
        </article>
    );
}
