import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { label } from '../constants';

export default function Profile({ lead, close, notice }) {
    const [history, setHistory] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [note, setNote] = useState('');

    const refresh = async () => {
        setHistory(
            await api(`/interessados/${lead.id}/interacoes`)
        );

        setTasks(
            await api(`/interessados/${lead.id}/tarefas`)
        );
    };

    useEffect(() => {
        refresh();
    }, [lead.id]);

    async function add(e) {
        e.preventDefault();

        if (!note.trim()) return;

        try {
            await api('/interacoes', {
                method: 'POST',
                body: JSON.stringify({
                    tipo: 'CONTATO',
                    descricao: note,
                    interessado: { id: lead.id }
                })
            });

            setNote('');
            refresh();
            notice('Interação registrada.');
        } catch (e) {
            notice(e.message);
        }
    }

    return (
        <div className="modal">
            <section>
                <button className="close" onClick={close}>
                    ×
                </button>

                <h1>{lead.nome}</h1>

                <p>
                    {lead.curso?.nome || 'Curso não definido'} ·{' '}
                    {lead.telefone} · {lead.email || 'Sem e-mail'}
                </p>

                <div className="profile-meta">
                    <span>
                        Etapa: <b>{label(lead.etapa)}</b>
                    </span>

                    <span>
                        Origem: <b>{lead.origem || '—'}</b>
                    </span>

                    <span>
                        Próximo contato:{' '}
                        <b>
                            {lead.proximoContato || 'Não agendado'}
                        </b>
                    </span>
                </div>

                <h2>Histórico de contatos</h2>

                <form onSubmit={add} className="note">
                    <input
                        placeholder="Descreva o contato realizado"
                        value={note}
                        onChange={e => setNote(e.target.value)}
                    />
                    <button>Registrar</button>
                </form>

                {history.length ? (
                    history.map(h => (
                        <article className="timeline" key={h.id}>
                            <b>{h.tipo}</b>
                            <p>{h.descricao}</p>
                            <small>
                                {new Date(h.data).toLocaleString(
                                    'pt-BR'
                                )}
                            </small>
                        </article>
                    ))
                ) : (
                    <p>Nenhuma interação registrada.</p>
                )}

                <h2>Tarefas deste interessado</h2>

                {tasks.map(t => (
                    <p key={t.id}>
                        • {t.titulo} — {t.status}
                    </p>
                ))}
            </section>
        </div>
    );
}
