import React from 'react';
// Usado para criar uma nova tarefa
export default function TaskFormCard({ f, setF, add, leads }) {
    return (
        <div className="task-form-card">
            <h2>Nova tarefa</h2>
            <form onSubmit={add}>
                <label>
                    Título
                    <input
                        placeholder="Ex: Ligar para confirmar presença"
                        value={f.titulo || ''}
                        onChange={e =>
                            setF({ // setF ataualiza o estado
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
                        value={f.interessado?.id || ''} // cria uma lista de interessados 
                        onChange={e =>
                            setF({
                                ...f,
                                interessado: e.target.value
                                    ? {
                                        id: +e.target.value // transforma o valor em numero
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

                <label className="full">
                    Descrição
                    <input
                        placeholder="Adicione observações adicionais para a tarefa..."
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
        </div>
    );
}
