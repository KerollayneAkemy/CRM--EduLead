import { useEffect, useState } from 'react';
import { api } from '../api';
import { label } from '../constants';

const formFromLead = lead => ({
    nome: lead.nome || '',
    telefone: lead.telefone || '',
    email: lead.email || '',
    origem: lead.origem || '',
    turno: lead.turno || '',
    observacoes: lead.observacoes || '',
    proximoContato: lead.proximoContato || '',
    etapa: lead.etapa,
    curso: lead.curso?.id ? { id: lead.curso.id } : null,
    responsavel: lead.responsavel?.id ? { id: lead.responsavel.id } : null
});

export default function Profile({ lead, session, close, notice, courses = [], users = [], load }) {
    const [history, setHistory] = useState([]);
    const [stageHistory, setStageHistory] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [attachments, setAttachments] = useState([]);
    const [note, setNote] = useState('');
    const [file, setFile] = useState(null);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState(() => formFromLead(lead));
    const isManager = ['GESTOR', 'GESTORA', 'ADMIN'].includes(session?.usuario?.cargo);

    const refresh = async () => {
        const [historyData, tasksData, stageHistoryData, attachmentsData] = await Promise.all([
            api(`/interessados/${lead.id}/interacoes`),
            api(`/interessados/${lead.id}/tarefas`),
            api(`/interessados/${lead.id}/historico-etapas`),
            api(`/interessados/${lead.id}/anexos`)
        ]);
        setHistory(historyData);
        setTasks(tasksData);
        setStageHistory(stageHistoryData);
        setAttachments(attachmentsData);
    };

    useEffect(() => {
        refresh();
    }, [lead.id]);

    useEffect(() => {
        setForm(formFromLead(lead));
        setEditing(false);
    }, [lead.id]);

    async function saveLead(event) {
        event.preventDefault();
        if (!form.nome.trim() || !form.telefone.trim()) {
            notice('Nome e telefone são obrigatórios.');
            return;
        }

        try {
            await api(`/interessados/${lead.id}`, {
                method: 'PUT',
                body: JSON.stringify(form)
            });
            await load?.();
            notice('Dados do interessado atualizados.');
            close();
        } catch (error) {
            notice(error.message);
        }
    }

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

    function openWhatsApp() {
        const digits = (lead.telefone || '').replace(/\D/g, '');
        if (digits.length < 10 || digits.length > 13) {
            notice('Informe um telefone válido antes de abrir o WhatsApp.');
            return;
        }

        const phone = digits.startsWith('55') ? digits : `55${digits}`;
        const course = lead.curso?.nome ? ` sobre o curso ${lead.curso.nome}` : '';
        const message = `Olá, ${lead.nome}! Tudo bem? Entramos em contato${course}. Como podemos ajudar?`;
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
    }

    async function upload(event) {
        event.preventDefault();
        if (!file) return;
        const form = new FormData();
        form.append('arquivo', file);
        try {
            await api(`/interessados/${lead.id}/anexos`, { method: 'POST', body: form });
            setFile(null);
            event.target.reset();
            refresh();
            notice('Arquivo enviado.');
        } catch (error) {
            notice(error.message);
        }
    }

    async function download(id) {
        try {
            const result = await api(`/anexos/${id}/download`);
            window.open(result.url, '_blank', 'noopener,noreferrer');
        } catch (error) {
            notice(error.message);
        }
    }

    async function removeAttachment(item) {
        if (!window.confirm(`Excluir o anexo "${item.nomeOriginal}"?`)) return;
        try {
            await api(`/anexos/${item.id}`, { method: 'DELETE' });
            await refresh();
            notice('Anexo excluído.');
        } catch (error) {
            notice(error.message);
        }
    }

    function canDeleteAttachment(item) {
        const cargo = session?.usuario?.cargo;
        return ['GESTOR', 'GESTORA', 'ADMIN'].includes(cargo)
            || item.enviadoPor?.id === session?.usuario?.id;
    }

    return (
        <div className="modal">
            <section>
                <button className="close" onClick={close}>
                    ×
                </button>

                <div className="profile-heading">
                    <h1>{lead.nome}</h1>
                    <button type="button" className="edit-lead-button" onClick={() => setEditing(!editing)}>
                        {editing ? 'Cancelar edição' : 'Editar dados'}
                    </button>
                </div>

                <p>
                    {lead.curso?.nome || 'Curso não definido'} ·{' '}
                    {lead.telefone} · {lead.email || 'Sem e-mail'}
                </p>

                <button type="button" className="whatsapp-contact" onClick={openWhatsApp}>
                    <span aria-hidden="true">◔</span>
                    Conversar no WhatsApp
                </button>

                {editing && (
                    <form className="lead-edit-form" onSubmit={saveLead}>
                        <div className="lead-edit-form-heading">
                            <b>Editar dados do interessado</b>
                            <span>As alterações serão aplicadas à ficha e à lista.</span>
                        </div>
                        <label>
                            Nome
                            <input value={form.nome} onChange={event => setForm({ ...form, nome: event.target.value })} />
                        </label>
                        <label>
                            Telefone
                            <input value={form.telefone} onChange={event => setForm({ ...form, telefone: event.target.value })} />
                        </label>
                        <label>
                            E-mail
                            <input type="email" value={form.email} onChange={event => setForm({ ...form, email: event.target.value })} />
                        </label>
                        <label>
                            Origem
                            <input value={form.origem} onChange={event => setForm({ ...form, origem: event.target.value })} />
                        </label>
                        <label>
                            Curso
                            <select value={form.curso?.id || ''} onChange={event => setForm({ ...form, curso: event.target.value ? { id: Number(event.target.value) } : null })}>
                                <option value="">Sem curso definido</option>
                                {courses.filter(course => course.ativo !== false || course.id === form.curso?.id).map(course => (
                                    <option key={course.id} value={course.id}>{course.nome}</option>
                                ))}
                            </select>
                        </label>
                        <label>
                            Turno
                            <input value={form.turno} onChange={event => setForm({ ...form, turno: event.target.value })} />
                        </label>
                        <label>
                            Próximo contato
                            <input type="date" value={form.proximoContato} onChange={event => setForm({ ...form, proximoContato: event.target.value })} />
                        </label>
                        {isManager && (
                            <label>
                                Responsável
                                <select value={form.responsavel?.id || ''} onChange={event => setForm({ ...form, responsavel: event.target.value ? { id: Number(event.target.value) } : null })}>
                                    <option value="">Sem responsável</option>
                                    {users.filter(user => user.ativo !== false).map(user => (
                                        <option key={user.id} value={user.id}>{user.nome}</option>
                                    ))}
                                </select>
                            </label>
                        )}
                        <label className="lead-edit-full">
                            Observações
                            <textarea value={form.observacoes} onChange={event => setForm({ ...form, observacoes: event.target.value })} />
                        </label>
                        <div className="lead-edit-actions">
                            <button type="button" className="lead-edit-cancel" onClick={() => setEditing(false)}>Cancelar</button>
                            <button type="submit">Salvar alterações</button>
                        </div>
                    </form>
                )}

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

                <h2>Histórico do funil</h2>
                {stageHistory.length ? (
                    stageHistory.map(item => (
                        <p className="stage-history-row" key={item.id}>
                            {label(item.etapaAnterior)} <b>→</b> {label(item.etapaNova)}
                            <small>{new Date(item.criadoEm).toLocaleString('pt-BR')}</small>
                        </p>
                    ))
                ) : (
                    <p>Nenhuma mudança de etapa registrada ainda.</p>
                )}

                <h2>Anexos</h2>
                <form onSubmit={upload} className="attachment-form">
                    <input type="file" accept=".pdf,.png,.jpg,.jpeg,.doc,.docx" onChange={e => setFile(e.target.files[0])} />
                    <button>Enviar arquivo</button>
                </form>
                {attachments.map(item => (
                    <div className="attachment-row" key={item.id}>
                        <span>{item.nomeOriginal} <small>({Math.ceil(item.tamanho / 1024)} KB)</small></span>
                        <div className="attachment-actions">
                            <button type="button" onClick={() => download(item.id)}>Baixar</button>
                            {canDeleteAttachment(item) && <button type="button" className="attachment-delete" onClick={() => removeAttachment(item)}>Excluir</button>}
                        </div>
                    </div>
                ))}
                {!attachments.length && <p>Nenhum anexo registrado.</p>}
            </section>
        </div>
    );
}
