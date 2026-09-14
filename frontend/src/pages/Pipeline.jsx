import React from 'react';
import { api } from '../api';
import { STAGES, label } from '../constants';

export default function Pipeline({ leads, load, notice }) {
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
