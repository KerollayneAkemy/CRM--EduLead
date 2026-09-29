import React from 'react';

export default function LeadFormScheduleSection({ f, setF }) {
    return (
        <div className="form-card-section">
            <div className="form-card-header">
                <span className="form-card-icon">📅</span>
                <div>
                    <h2>Agendamento e observações</h2>
                    <small>Programe o próximo retorno e registre notas importantes.</small>
                </div>
            </div>

            <div className="form-grid-2">
                <label className="full">
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
                        placeholder="Descreva detalhes relevantes sobre a negociação ou perfil do interessado..."
                    />
                </label>
            </div>
        </div>
    );
}
