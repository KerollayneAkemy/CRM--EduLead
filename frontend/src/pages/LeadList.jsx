import React, { useMemo, useState } from 'react';
import { STAGES, label } from '../constants';

// o componente que mostra a lista de interessados cadastrados e permite pesquisar e filtrar por etapa

const normalize = s => String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, ''); // padronizar um texto antes de comparar upercase transnforma em maisculo , replace remove caracteres

function isStageMatch(leadEtapa, selectedStage) { // A etapa desse interessado é a mesma etapa que o usuário selecionou no filtro?
    if (!selectedStage) return true; // Se nenhuma etapa foi selecionada, retorna true para mostrar todos os interessados
    if (!leadEtapa) return false; // se n tiver uma etapa cadsatrada , n mostra filtro

    const leadStr = typeof leadEtapa === 'object' ? (leadEtapa.name || leadEtapa.etapa || '') : String(leadEtapa); // caso venha em formato difernte
    const selStr = typeof selectedStage === 'object' ? (selectedStage.name || selectedStage.etapa || '') : String(selectedStage);
   // pega a etapa e tranforma em texto
    const leadNorm = normalize(leadStr);
    const selNorm = normalize(selStr); // normaliza para facilitar a comparação
 
    if (leadNorm === selNorm) return true;
    
    const leadLabelNorm = normalize(label(leadStr));
    const selLabelNorm = normalize(label(selStr));
    if (leadLabelNorm === selLabelNorm) return true; // comparação pricipal

    if (leadNorm.length >= 4 && selNorm.length >= 4) { // extra
        if (selNorm.includes(leadNorm) || leadNorm.includes(selNorm)) return true;
    }
    if (leadLabelNorm.length >= 4 && selLabelNorm.length >= 4) {
        if (selLabelNorm.includes(leadLabelNorm) || leadLabelNorm.includes(selLabelNorm)) return true;
    }

    return false;
}
// Pegar a lista de interessados e deixar somente aqueles que correspondem à pesquisa e à etapa selecionada
export default function LeadList({ leads, open, nav }) {
    const [q, setQ] = useState('');
    const [stage, setStage] = useState('');

    const filtered = useMemo(
        () =>
            leads.filter(
                l =>
                    `${l.nome} ${l.email || ''} ${l.curso?.nome || ''}`
                        .toLowerCase()
                        .includes(q.toLowerCase()) &&
                    isStageMatch(l.etapa, stage)
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
                        Nenhum interessado corresponde aos filtros aplicados.
                    </div>
                )}
            </div>
        </section>
    );
}
