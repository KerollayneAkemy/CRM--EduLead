import React, { useEffect, useState } from 'react';
import { api } from '../api';

export default function Tasks({ leads, notice }) {
    const [tasks, setTasks] = useState([]);
    const [f, setF] = useState({});
    const [taskToDelete, setTaskToDelete] = useState(null);

    const refresh = () =>
        api('/tarefas').then(setTasks);

    useEffect(() => {
        refresh();
    }, []);

    async function add(e) {
        e.preventDefault();

        try {
            await api('/tarefas', {
                method: 'POST',
                body: JSON.stringify(f)
            });

            setF({});
            refresh();
            notice('Tarefa criada.');
        } catch (e) {
            notice(e.message);
        }
    }

    async function done(id) {
        try {
            await api(`/tarefas/${id}/concluir`, {
                method: 'PATCH'
            });

            refresh();
            notice('Tarefa concluída.');
        } catch (e) {
            notice(e.message);
        }
    }

    async function removeTask(id) {
        try {
            await api(`/tarefas/${id}`, {
                method: 'DELETE'
            });

            setTaskToDelete(null);
            refresh();
            notice('Tarefa excluída com sucesso.');
        } catch (e) {
            notice(e.message);
        }
    }

    return (
        <div className="tasks-container">
            <div className="title-row">
                <div>
                    <p className="eyebrow">ORGANIZAÇÃO E AGENDA</p>
                    <h1>Tarefas e lembretes</h1>
                    <p>Acompanhe e gerencie pendências da equipe de captação.</p>
                </div>
            </div>

            <div className="task-form-card">
                <h2>Nova tarefa</h2>
                <form onSubmit={add}>
                    <label>
                        Título
                        <input
                            placeholder="Ex: Ligar para confirmar presença"
                            value={f.titulo || ''}
                            onChange={e =>
                                setF({
                                    ...f,
                                    titulo: e.target.value
                                })
                            }
                        />
                    </label>

                    <label>
                        Prazo
                        <input
                            type="date"
                            value={f.prazo || ''}
                            onChange={e =>
                                setF({
                                    ...f,
                                    prazo: e.target.value
                                })
                            }
                        />
                    </label>

                    <label>
                        Interessado
                        <select
                            value={f.interessado?.id || ''}
                            onChange={e =>
                                setF({
                                    ...f,
                                    interessado: e.target.value
                                        ? {
                                            id: +e.target.value
                                        }
                                        : null
                                })
                            }
                        >
                            <option value="">Sem vínculo</option>

                            {leads.map(l => (
                                <option key={l.id} value={l.id}>
                                    {l.nome}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="full">
                        Descrição
                        <input
                            placeholder="Adicione observações adicionais para a tarefa..."
                            value={f.descricao || ''}
                            onChange={e =>
                                setF({
                                    ...f,
                                    descricao: e.target.value
                                })
                            }
                        />
                    </label>

                    <button>Criar tarefa</button>
                </form>
            </div>

            <div className="tasks-list">
                {tasks.map(t => {
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
                })}

                {!tasks.length && (
                    <div className="empty-state" style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid var(--border)' }}>
                        Nenhuma tarefa cadastrada até o momento.
                    </div>
                )}
            </div>

            {taskToDelete && (
                <div className="modal">
                    <section style={{ maxWidth: '440px', textAlign: 'center' }}>
                        <button className="close" onClick={() => setTaskToDelete(null)}>
                            ×
                        </button>
                        <h1 style={{ fontSize: '20px' }}>Excluir tarefa</h1>
                        <p style={{ color: 'var(--muted)', margin: '14px 0 24px', fontSize: '14px' }}>
                            Tem certeza que deseja excluir a tarefa "{taskToDelete.titulo}"?
                        </p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <button
                                type="button"
                                style={{
                                    background: '#f1f5f9',
                                    color: '#475569',
                                    border: '1px solid #cbd5e1',
                                    boxShadow: 'none',
                                    padding: '10px 18px'
                                }}
                                onClick={() => setTaskToDelete(null)}
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                style={{
                                    background: 'linear-gradient(135deg, #d94352, #b91c1c)',
                                    boxShadow: '0 6px 16px rgba(217, 67, 82, 0.3)',
                                    padding: '10px 18px'
                                }}
                                onClick={() => removeTask(taskToDelete.id)}
                            >
                                Excluir
                            </button>
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
}
