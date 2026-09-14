import React, { useEffect, useState } from 'react';
import { api } from '../api';

export default function Tasks({ leads, notice }) {
    const [tasks, setTasks] = useState([]);
    const [f, setF] = useState({});

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
        await api(`/tarefas/${id}/concluir`, {
            method: 'PATCH'
        });

        refresh();
        notice('Tarefa concluída.');
    }

    return (
        <>
            <h1>Tarefas e lembretes</h1>

            <form onSubmit={add}>
                <h2>Nova tarefa</h2>

                <label>
                    Título
                    <input
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

                <label>
                    Descrição
                    <input
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

            {tasks.map(t => (
                <article className="task" key={t.id}>
                    <b>{t.titulo}</b>

                    <span>
                        {t.descricao} · {t.prazo || 'Sem prazo'} ·{' '}
                        {t.status}
                    </span>

                    {t.status === 'PENDENTE' && (
                        <button onClick={() => done(t.id)}>
                            Concluir
                        </button>
                    )}
                </article>
            ))}
        </>
    );
}
