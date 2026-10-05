import React from 'react';
// Responsável pela renderização da Seção de Curso e Atendimento (dropdowns de seleção).
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
                        value={f.curso?.id || ''} // Define qual valor está atualmente selecionado no <select>
                        onChange={e => //É um evento , então aqui Ele acontece quando o usuário muda o valor do campo
                            setF({
                                ...f, // mantém os dados que já estavam preenchidos e eu altero somente o campo turno para o valor escolhido pelo usuário
                                curso: e.target.value // Operador ternário , pega o valro que o usuário acabou de colocar no campo
                                    ? { id: +e.target.value }
                                    : null // não existe o curso selecionado
                            })
                        }
                        //Pegue todos os dados atuais do formulário, mantenha eles 
                        // e altere apenas o campo curso para o ID selecionado. Se nenhum curso for selecionado, deixe curso como null
                    >
                        <option value="">Selecione um curso</option>
                        {courses
                            .filter(c => c.ativo !== false) //filtro serve para mostrar somente os cursos que não estão inativos e depois usando o map para transformar cada curso em uma opção do campo de seleção
                            .map(c => ( //percorre a array c= cursos, key = é uma informação que o React usa para identificar cada elemento de uma lista.
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
                            setF({ ...f, turno: e.target.value }) //setF -> Atualiza dados do formulário
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
