import React from 'react';

export default function LeadFormCourseSection({ f, setF, courses, users }) {
    return (
        <div className="form-card-section">
            <div className="form-card-header">
                <span className="form-card-icon">🎓</span>
                <div>
                    <h2>Curso e atendimento</h2>
                    <small>Defina o curso de interesse, origem da captação e atendente responsável.</small>
                </div>
            </div>

            <div className="form-grid-2">
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
                        <option value="">Selecione um curso</option>
                        {courses
                            .filter(c => c.ativo !== false)
                            .map(c => (
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
                        <option value="">Selecione o turno</option>
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
            </div>
        </div>
    );
}
