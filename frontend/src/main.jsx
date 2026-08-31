import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

const API = 'http://localhost:8080/api';

const STAGES = [
    'NOVO_INTERESSADO',
    'PRIMEIRO_CONTATO',
    'AGUARDANDO_RETORNO',
    'VISITA_AULA_EXPERIMENTAL',
    'DOCUMENTACAO',
    'MATRICULA_REALIZADA',
    'DESISTIU'
];

const label = x =>
    (x || '—')
        .replaceAll('_', ' ')
        .toLowerCase()
        .replace(/\b\w/g, c => c.toUpperCase());

const phoneMask = value => {
    const d = value.replace(/\D/g, '').slice(0, 11);
    return d.replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
};

async function api(path, options = {}) {
    const r = await fetch(API + path, {
        headers: { 'Content-Type': 'application/json' },
        ...options
    });

    if (!r.ok) {
        let m = 'Não foi possível concluir a ação.';
        try {
            m = (await r.json()).message || m;
        } catch { }

        throw Error(m);
    }

    return r.status === 204 ? null : r.json();
}

function App() {
    const [session, setSession] = useState(() =>
        JSON.parse(localStorage.getItem('edulead-session') || 'null')
    );

    return session ? (
        <CRM
            logout={() => {
                localStorage.removeItem('edulead-session');
                setSession(null);
            }}
        />
    ) : (
        <Login onLogin={setSession} />
    );
}

function Login({ onLogin }) {
    const [f, setF] = useState({
        email: 'ana@edulead.com',
        senha: '123456'
    });
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    async function submit(e) {
        e.preventDefault();
        setBusy(true);
        setError('');

        try {
            const result = await api('/auth/login', {
                method: 'POST',
                body: JSON.stringify(f)
            });

            localStorage.setItem('edulead-session', JSON.stringify(result));
            onLogin(result);
        } catch (e) {
            setError(e.message);
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="login">
            <form onSubmit={submit}>
                <h1>EduLead</h1>
                <p>Entre para acompanhar suas captações.</p>

                <label>
                    E-mail
                    <input
                        type="email"
                        value={f.email}
                        onChange={e => setF({ ...f, email: e.target.value })}
                    />
                </label>

                <label>
                    Senha
                    <input
                        type="password"
                        value={f.senha}
                        onChange={e => setF({ ...f, senha: e.target.value })}
                    />
                </label>

                {error && <p className="error">{error}</p>}

                <button disabled={busy}>
                    {busy ? 'Entrando...' : 'Entrar'}
                </button>

                <small>Demo: ana@edulead.com · 123456</small>
            </form>
        </div>
    );
}

function CRM({ logout }) {
    const [page, setPage] = useState('Dashboard');
    const [leads, setLeads] = useState([]);
    const [courses, setCourses] = useState([]);
    const [users, setUsers] = useState([]);
    const [dash, setDash] = useState({});
    const [toast, setToast] = useState('');
    const [selected, setSelected] = useState(null);

    const notice = m => {
        setToast(m);
        setTimeout(() => setToast(''), 3000);
    };

    const load = async () => {
        try {
            const [a, b, c, d] = await Promise.all([
                api('/interessados'),
                api('/cursos'),
                api('/usuarios'),
                api('/dashboard')
            ]);

            setLeads(a);
            setCourses(b);
            setUsers(c);
            setDash(d);
        } catch (e) {
            notice(e.message);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const nav = p => {
        setSelected(null);
        setPage(p);
    };

    const common = {
        leads,
        courses,
        users,
        load,
        notice,
        nav
    };

    return (
        <>
            <header>
                <b>EduLead</b>
                <span>CRM para captação de alunos</span>
                <button className="logout" onClick={logout}>
                    Sair
                </button>
            </header>

            <aside>
                {[
                    'Dashboard',
                    'Funil',
                    'Interessados',
                    'Novo interessado',
                    'Cursos',
                    'Usuários',
                    'Tarefas'
                ].map(x => (
                    <button
                        key={x}
                        className={page === x ? 'on' : ''}
                        onClick={() => nav(x)}
                    >
                        {x}
                    </button>
                ))}
            </aside>

            <main>
                {page === 'Dashboard' && (
                    <Dashboard dash={dash} leads={leads} nav={nav} />
                )}

                {page === 'Funil' && <Pipeline {...common} />}

                {page === 'Interessados' && (
                    <LeadList {...common} open={setSelected} />
                )}

                {page === 'Novo interessado' && <LeadForm {...common} />}

                {page === 'Cursos' && (
                    <Records
                        {...common}
                        type="Cursos"
                        path="/cursos"
                        fields={['nome', 'descricao']}
                    />
                )}

                {page === 'Usuários' && (
                    <Records
                        {...common}
                        type="Usuários"
                        path="/usuarios"
                        fields={['nome', 'email', 'senha', 'cargo']}
                    />
                )}

                {page === 'Tarefas' && <Tasks {...common} />}

                {selected && (
                    <Profile
                        lead={selected}
                        close={() => setSelected(null)}
                        notice={notice}
                    />
                )}
            </main>

            {toast && <div className="toast">✓ {toast}</div>}
        </>
    );
}

function Dashboard({ dash, leads, nav }) {
    const metrics = [
        ['Interessados', dash.totalInteressados],
        ['Matrículas', dash.matriculas],
        ['Conversão', `${dash.taxaConversao || 0}%`],
        ['Tarefas pendentes', dash.tarefasPendentes]
    ];

    const followUps = leads
        .filter(
            l =>
                l.proximoContato &&
                l.etapa !== 'MATRICULA_REALIZADA' &&
                l.etapa !== 'DESISTIU'
        )
        .sort((a, b) =>
            a.proximoContato.localeCompare(b.proximoContato)
        )
        .slice(0, 4);

    const dateLabel = date => {
        const today = new Date().toISOString().slice(0, 10);
        const tomorrow = new Date(Date.now() + 86400000)
            .toISOString()
            .slice(0, 10);

        return date === today
            ? 'Hoje'
            : date === tomorrow
                ? 'Amanhã'
                : new Date(`${date}T12:00`).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'short'
                });
    };

    return (
        <>
            <div className="title-row">
                <div>
                    <p className="eyebrow">CENTRAL DE OPERAÇÕES</p>
                    <h1>Dashboard</h1>
                    <p>Visão geral da captação de alunos.</p>
                </div>

                <button onClick={() => nav('Novo interessado')}>
                    + Novo interessado
                </button>
            </div>

            <section className="cards">
                {metrics.map(([n, v]) => (
                    <article key={n}>
                        <small>{n}</small>
                        <h2>{v ?? 0}</h2>
                    </article>
                ))}
            </section>

            <section className="quick-actions">
                <button onClick={() => nav('Novo interessado')}>
                    <span>＋</span>
                    <b>Novo interessado</b>
                    <small>Registre um novo contato.</small>
                </button>

                <button onClick={() => nav('Funil')}>
                    <span>↗</span>
                    <b>Atualizar funil</b>
                    <small>Avance oportunidades.</small>
                </button>

                <button onClick={() => nav('Tarefas')}>
                    <span>✓</span>
                    <b>Organizar agenda</b>
                    <small>Veja suas pendências.</small>
                </button>
            </section>

            <section className="dashboard-columns">
                <div>
                    <section className="insights">
                        <Chart
                            title="Interessados por etapa"
                            data={dash.porEtapa}
                        />
                        <Chart
                            title="Origem dos contatos"
                            data={dash.porOrigem}
                        />
                        <Chart
                            title="Cursos mais procurados"
                            data={dash.porCurso}
                        />
                    </section>

                    <section className="overview">
                        <h2>Contatos recentes</h2>

                        {leads
                            .slice(-5)
                            .reverse()
                            .map(l => (
                                <div className="overview-row" key={l.id}>
                                    <b>{l.nome}</b>
                                    <span>
                                        {l.curso?.nome || 'Sem curso'}
                                    </span>
                                    <em>{label(l.etapa)}</em>
                                </div>
                            ))}

                        {!leads.length && (
                            <p>Nenhum interessado cadastrado.</p>
                        )}
                    </section>
                </div>

                <aside className="follow-up">
                    <div>
                        <p className="eyebrow">PRÓXIMOS 7 DIAS</p>
                        <h2>Retornos agendados</h2>
                    </div>

                    {followUps.length ? (
                        followUps.map(l => (
                            <div className="follow-up-item" key={l.id}>
                                <span>{dateLabel(l.proximoContato)}</span>

                                <div>
                                    <b>{l.nome}</b>
                                    <small>{l.telefone}</small>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="empty-state">
                            Nenhum retorno agendado.
                        </p>
                    )}

                    <button
                        className="link"
                        onClick={() => nav('Interessados')}
                    >
                        Ver interessados →
                    </button>
                </aside>
            </section>
        </>
    );
}

function Chart({ title, data = {} }) {
    const entries = Object.entries(data);
    const max = Math.max(...entries.map(x => x[1]), 1);

    return (
        <article className="chart">
            <h2>{title}</h2>

            {entries.length ? (
                entries.map(([k, v]) => (
                    <div className="bar" key={k}>
                        <span>{label(k)}</span>

                        <i>
                            <b style={{ width: `${(v / max) * 100}%` }} />
                        </i>

                        <strong>{v}</strong>
                    </div>
                ))
            ) : (
                <p>Sem dados ainda.</p>
            )}
        </article>
    );
}

function Pipeline({ leads, load, notice }) {
    async function move(id, etapa) {
        try {
            await api(`/interessados/${id}/etapa`, {
                method: 'PATCH',
                body: JSON.stringify({ etapa })
            });

            load();
            notice('Etapa atualizada.');
        } catch (e) {
            notice(e.message);
        }
    }

    return (
        <>
            <div className="title-row">
                <div>
                    <h1>Funil de matrículas</h1>
                    <p>
                        Arraste os cartões para avançar um interessado.
                    </p>
                </div>
            </div>

            <div className="kanban">
                {STAGES.map(s => (
                    <section
                        className="col"
                        key={s}
                        onDragOver={e => e.preventDefault()}
                        onDrop={e =>
                            move(
                                e.dataTransfer.getData('lead-id'),
                                s
                            )
                        }
                    >
                        <h3>
                            {label(s)} ·{' '}
                            {leads.filter(l => l.etapa === s).length}
                        </h3>

                        {leads
                            .filter(l => l.etapa === s)
                            .map(l => (
                                <article
                                    className="lead"
                                    key={l.id}
                                    draggable
                                    onDragStart={e =>
                                        e.dataTransfer.setData(
                                            'lead-id',
                                            l.id
                                        )
                                    }
                                >
                                    <b>{l.nome}</b>

                                    <small>
                                        {l.curso?.nome ||
                                            'Curso não definido'}{' '}
                                        · {l.telefone}
                                    </small>

                                    <select
                                        value={l.etapa}
                                        onChange={e =>
                                            move(
                                                l.id,
                                                e.target.value
                                            )
                                        }
                                    >
                                        {STAGES.map(x => (
                                            <option key={x}>
                                                {label(x)}
                                            </option>
                                        ))}
                                    </select>
                                </article>
                            ))}
                    </section>
                ))}
            </div>
        </>
    );
}

function LeadList({ leads, open, nav }) {
    const [q, setQ] = useState('');
    const [stage, setStage] = useState('');

    const filtered = useMemo(
        () =>
            leads.filter(
                l =>
                    `${l.nome} ${l.email || ''} ${l.curso?.nome || ''
                        }`
                        .toLowerCase()
                        .includes(q.toLowerCase()) &&
                    (!stage || l.etapa === stage)
            ),
        [leads, q, stage]
    );

    return (
        <section className="directory-page">
            <div className="title-row">
                <div>
                    <p className="eyebrow">BASE DE RELACIONAMENTO</p>
                    <h1>Interessados</h1>
                    <p>{filtered.length} contato(s) encontrado(s).</p>
                </div>

                <button onClick={() => nav('Novo interessado')}>
                    + Cadastrar interessado
                </button>
            </div>

            <div className="directory-toolbar">
                <input
                    placeholder="Buscar nome, e-mail ou curso"
                    value={q}
                    onChange={e => setQ(e.target.value)}
                />

                <select
                    value={stage}
                    onChange={e => setStage(e.target.value)}
                >
                    <option value="">Todas as etapas</option>

                    {STAGES.map(x => (
                        <option key={x} value={x}>
                            {label(x)}
                        </option>
                    ))}
                </select>
            </div>

            <div className="directory-table">
                <table>
                    <thead>
                        <tr>
                            <th>Interessado</th>
                            <th>Curso</th>
                            <th>Telefone</th>
                            <th>Origem</th>
                            <th>Etapa</th>
                            <th></th>
                        </tr>
                    </thead>

                    <tbody>
                        {filtered.map(l => (
                            <tr key={l.id}>
                                <td>
                                    <b>{l.nome}</b>
                                    <small>
                                        {l.email || 'Sem e-mail'}
                                    </small>
                                </td>

                                <td>{l.curso?.nome || '—'}</td>
                                <td>{l.telefone}</td>
                                <td>{l.origem || '—'}</td>

                                <td>
                                    <em>{label(l.etapa)}</em>
                                </td>

                                <td>
                                    <button
                                        className="link"
                                        onClick={() => open(l)}
                                    >
                                        Abrir ficha →
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {!filtered.length && (
                    <div className="empty-state">
                        Nenhum interessado corresponde aos filtros
                        aplicados.
                    </div>
                )}
            </div>
        </section>
    );
}

function LeadForm({ courses, users, load, notice, nav }) {
    const [f, setF] = useState({
        etapa: STAGES[0],
        origem: 'Instagram'
    });

    const [busy, setBusy] = useState(false);

    const input = (k, type = 'text') => (
        <label>
            {label(k)}
            <input
                type={type}
                inputMode={k === 'telefone' ? 'tel' : undefined}
                placeholder={
                    k === 'telefone'
                        ? '(00) 00000-0000'
                        : undefined
                }
                value={f[k] || ''}
                onChange={e =>
                    setF({
                        ...f,
                        [k]:
                            k === 'telefone'
                                ? phoneMask(e.target.value)
                                : e.target.value
                    })
                }
            />
        </label>
    );

    async function submit(e) {
        e.preventDefault();

        if (!f.nome || !f.telefone) {
            return notice('Nome e telefone são obrigatórios.');
        }

        setBusy(true);

        try {
            await api('/interessados', {
                method: 'POST',
                body: JSON.stringify(f)
            });

            notice('Interessado cadastrado com sucesso.');
            await load();
            nav('Interessados');
        } catch (e) {
            notice(e.message);
        } finally {
            setBusy(false);
        }
    }

    return (
        <form onSubmit={submit}>
            <h1>Novo interessado</h1>

            {input('nome')}
            {input('telefone')}
            {input('email', 'email')}

            <label>
                Curso de interesse
                <select
                    value={f.curso?.id || ''}
                    onChange={e =>
                        setF({
                            ...f,
                            curso: e.target.value
                                ? { id: +e.target.value }
                                : null
                        })
                    }
                >
                    <option value="">Selecione</option>

                    {courses.map(c => (
                        <option key={c.id} value={c.id}>
                            {c.nome}
                        </option>
                    ))}
                </select>
            </label>

            <label>
                Turno desejado
                <select
                    value={f.turno || ''}
                    onChange={e =>
                        setF({ ...f, turno: e.target.value })
                    }
                >
                    <option value="">Selecione</option>
                    <option>Matutino</option>
                    <option>Vespertino</option>
                    <option>Noturno</option>
                </select>
            </label>

            <label>
                Origem do contato
                <select
                    value={f.origem || ''}
                    onChange={e =>
                        setF({ ...f, origem: e.target.value })
                    }
                >
                    {[
                        'Instagram',
                        'WhatsApp',
                        'Indicação',
                        'Site',
                        'Visita presencial',
                        'Evento',
                        'Outro'
                    ].map(x => (
                        <option key={x}>{x}</option>
                    ))}
                </select>
            </label>

            <label>
                Atendente responsável
                <select
                    value={f.responsavel?.id || ''}
                    onChange={e =>
                        setF({
                            ...f,
                            responsavel: e.target.value
                                ? { id: +e.target.value }
                                : null
                        })
                    }
                >
                    <option value="">Não atribuído</option>

                    {users.map(u => (
                        <option key={u.id} value={u.id}>
                            {u.nome}
                        </option>
                    ))}
                </select>
            </label>

            <label>
                Próximo contato
                <input
                    type="date"
                    value={f.proximoContato || ''}
                    onChange={e =>
                        setF({
                            ...f,
                            proximoContato: e.target.value
                        })
                    }
                />
            </label>

            <label className="full">
                Observações
                <textarea
                    value={f.observacoes || ''}
                    onChange={e =>
                        setF({
                            ...f,
                            observacoes: e.target.value
                        })
                    }
                />
            </label>

            <button disabled={busy}>
                {busy ? 'Salvando...' : 'Salvar interessado'}
            </button>
        </form>
    );
}

function Profile({ lead, close, notice }) {
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

function Records({ type, path, fields, notice, load }) {
    const [items, setItems] = useState([]);
    const [f, setF] = useState({});

    const refresh = () => api(path).then(setItems);

    useEffect(() => {
        refresh();
    }, [path]);

    async function add(e) {
        e.preventDefault();

        try {
            await api(path, {
                method: 'POST',
                body: JSON.stringify(f)
            });

            setF({});
            refresh();
            load();
            notice('Cadastro realizado.');
        } catch (e) {
            notice(e.message);
        }
    }

    const singular = type === 'Cursos' ? 'curso' : 'usuário';

    return (
        <section className="management-page">
            <div className="title-row">
                <div>
                    <p className="eyebrow">CONFIGURAÇÕES</p>
                    <h1>{type}</h1>
                    <p>
                        Gerencie os dados usados pela operação do
                        CRM.
                    </p>
                </div>
            </div>

            <div className="management-grid">
                <form className="side-form" onSubmit={add}>
                    <h2>Novo {singular}</h2>
                    <p>
                        Preencha os dados para disponibilizá-lo no
                        sistema.
                    </p>

                    {fields.map(k => (
                        <label key={k}>
                            {label(k)}
                            <input
                                type={
                                    k === 'senha'
                                        ? 'password'
                                        : k === 'email'
                                            ? 'email'
                                            : 'text'
                                }
                                value={f[k] || ''}
                                onChange={e =>
                                    setF({
                                        ...f,
                                        [k]: e.target.value
                                    })
                                }
                            />
                        </label>
                    ))}

                    <button>Salvar {singular}</button>
                </form>

                <section className="records-panel">
                    <div className="records-panel-head">
                        <div>
                            <h2>{type} cadastrados</h2>
                            <span>
                                {items.length} registro(s)
                            </span>
                        </div>
                    </div>

                    <div className="record-cards">
                        {items.map(x => (
                            <article
                                className="record-card"
                                key={x.id}
                            >
                                <span className="record-avatar">
                                    {x.nome?.slice(0, 1)}
                                </span>

                                <div>
                                    <b>{x.nome}</b>
                                    <small>
                                        {x.email ||
                                            x.descricao ||
                                            x.cargo ||
                                            'Ativo'}
                                    </small>
                                </div>

                                <em>
                                    {x.ativo === false
                                        ? 'Inativo'
                                        : 'Ativo'}
                                </em>
                            </article>
                        ))}

                        {!items.length && (
                            <div className="empty-state">
                                Nenhum registro cadastrado ainda.
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </section>
    );
}

function Tasks({ leads, notice }) {
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

createRoot(document.getElementById('root')).render(<App />);