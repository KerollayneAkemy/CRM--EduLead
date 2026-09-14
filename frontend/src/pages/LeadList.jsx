import React, { useMemo, useState } from 'react';
import { STAGES, label } from '../constants';

export default function LeadList({ leads, open, nav }) {
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
