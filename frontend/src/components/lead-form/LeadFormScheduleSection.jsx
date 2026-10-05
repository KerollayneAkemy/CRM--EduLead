import React from 'react';
//  Este arquivo cuida do agendamento da data de retorno e caixa de texto de observações.
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
                        value={f.proximoContato || ''} // Pegue o próximo contato que está armazenado no formulário
                        onChange={e =>
                            setF({
                                ...f,
                                proximoContato: e.target.value // Pegue o valor que o usuário acabou de colocar no campo
                            })
                        } //tudo junto: Pegue os dados atuais do formulário, mantenha todos eles 
                          //e atualize apenas proximoContato com o valor que o usuário acabou de escolher.
                    />
                </label>

                <label className="full">
                    Observações
                    <textarea
                        value={f.observacoes || ''}
                        onChange={e =>
                            setF({
                                ...f, // Pega as propriedades existentes de f e copia para um novo objeto
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
