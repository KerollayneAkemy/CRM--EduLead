import React from 'react';
import { api } from '../api';
import { STAGES, label } from '../constants';
// funil
export default function Pipeline({ leads, load, notice }) {
    async function move(id, etapa) {
        try {
            await api(`/interessados/${id}/etapa`, { //alteração no back
                method: 'PATCH', // alteração parcial
                body: JSON.stringify({ etapa })
            });

            load();
            notice('Etapa atualizada.');
        } catch (e) {
            notice(e.message);
        }
    }

    return (
        <section className="funnel-container">
            <div className="title-row">
                <div>
                    <p className="eyebrow">GESTÃO DE OPORTUNIDADES</p>
                    <h1>Funil de matrículas</h1>
                    <p>
                        Arraste os cartões ou altere a etapa no seletor para avançar um interessado.
                    </p>
                </div>
            </div>

            <div className="kanban">
                {STAGES.map((s, index) => {
                    const stageLeads = leads.filter(l => l.etapa === s); // separa os interessados q pertencem a etapa atual
                    return (
                        <React.Fragment key={s}>
                            <section
                                className="col"
                                onDragOver={e => e.preventDefault()}
                                onDrop={e =>
                                    move(
                                        e.dataTransfer.getData('lead-id'),
                                        s
                                    )
                                }
                            >
                                <div className="col-header">
                                    <div className="col-title">
                                        <b>{label(s)}</b>
                                    </div>
                                    <span className="col-badge">
                                        {stageLeads.length} // contar os interessados
                                    </span>
                                </div>

                                <div className="col-content">
                                    {stageLeads.map(l => (
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
                                                {STAGES.map(x => (  // percorre todas as etapas e cria uma opção para cada uma.
                                                    <option key={x} value={x}>
                                                        {label(x)}
                                                    </option>
                                                ))}
                                            </select>
                                        </article>
                                    ))}

                                    {!stageLeads.length && (
                                        <div className="empty-state" style={{ padding: '16px 8px', fontSize: '12px' }}>
                                            Nenhum interessado nesta etapa.
                                        </div>
                                    )}
                                </div>
                            </section>

                            {index < STAGES.length - 1 && (
                                <div className="col-flow-arrow" aria-hidden="true">
                                    ↓
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </section>
    );
}
