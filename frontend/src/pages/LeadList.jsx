import { useMemo, useState } from 'react';
import { STAGES, label } from '../constants';

const PAGE_SIZE = 8;

const normalize = value => String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

function isStageMatch(leadEtapa, selectedStage) {
    if (!selectedStage) return true;
    if (!leadEtapa) return false;

    const leadStr = typeof leadEtapa === 'object' ? (leadEtapa.name || leadEtapa.etapa || '') : String(leadEtapa);
    const selStr = typeof selectedStage === 'object' ? (selectedStage.name || selectedStage.etapa || '') : String(selectedStage);
    const leadNorm = normalize(leadStr);
    const selNorm = normalize(selStr);
 
    if (leadNorm === selNorm) return true;
    
    const leadLabelNorm = normalize(label(leadStr));
    const selLabelNorm = normalize(label(selStr));
    if (leadLabelNorm === selLabelNorm) return true;

    if (leadNorm.length >= 4 && selNorm.length >= 4) {
        if (selNorm.includes(leadNorm) || leadNorm.includes(selNorm)) return true;
    }
    if (leadLabelNorm.length >= 4 && selLabelNorm.length >= 4) {
        if (selLabelNorm.includes(leadLabelNorm) || leadLabelNorm.includes(selLabelNorm)) return true;
    }

    return false;
}

function csvValue(value) {
    return `"${String(value ?? '').replaceAll('"', '""')}"`;
}

export default function LeadList({ leads, open, nav }) {
    const [q, setQ] = useState('');
    const [stage, setStage] = useState('');
    const [page, setPage] = useState(1);

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
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);
    const visibleLeads = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    function updateSearch(value) {
        setQ(value);
        setPage(1);
    }

    function updateStage(value) {
        setStage(value);
        setPage(1);
    }

    function exportCsv() {
        const rows = [
            ['Nome', 'E-mail', 'Telefone', 'Curso', 'Origem', 'Etapa'],
            ...filtered.map(lead => [
                lead.nome,
                lead.email,
                lead.telefone,
                lead.curso?.nome || '',
                lead.origem,
                label(lead.etapa)
            ])
        ];
        const content = `\uFEFF${rows.map(row => row.map(csvValue).join(';')).join('\n')}`;
        const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8;' }));
        const link = document.createElement('a');
        link.href = url;
        link.download = 'interessados-edulead.csv';
        link.click();
        URL.revokeObjectURL(url);
    }

    return (
        <section className="directory-page">
            <div className="title-row">
                <div>
                    <p className="eyebrow">BASE DE RELACIONAMENTO</p>
                    <h1>Interessados</h1>
                    <p>{filtered.length} contato(s) encontrado(s).</p>
                </div>

                <div className="directory-actions">
                    <button className="directory-export" onClick={exportCsv} disabled={!filtered.length}>
                        Exportar CSV
                    </button>
                    <button onClick={() => nav('Novo interessado')}>
                        + Cadastrar interessado
                    </button>
                </div>
            </div>

            <div className="directory-toolbar">
                <input
                    placeholder="Buscar nome, e-mail ou curso"
                    value={q}
                    onChange={e => updateSearch(e.target.value)}
                />

                <select
                    value={stage}
                    onChange={e => updateStage(e.target.value)}
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
                        {visibleLeads.map(l => (
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

                {filtered.length > PAGE_SIZE && (
                    <nav className="directory-pagination" aria-label="Paginação de interessados">
                        <button
                            type="button"
                            onClick={() => setPage(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            ← Anterior
                        </button>
                        <span>Página {currentPage} de {totalPages}</span>
                        <button
                            type="button"
                            onClick={() => setPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            Próxima →
                        </button>
                    </nav>
                )}
            </div>
        </section>
    );
}
