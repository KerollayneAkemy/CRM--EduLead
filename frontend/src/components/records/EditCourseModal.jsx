import React from 'react';
//Caso o usuário digitar errado o curso e quiser alterar temos a criação dessa página pra editar o curso
export default function EditCourseModal({ editingCourse, setEditingCourse, saveEdit }) {
    if (!editingCourse) return null; // Verifica se existe um curso sendo editado

    return (
        <div className="modal">
            <section>
                <button
                    className="close"
                    onClick={() => setEditingCourse(null)} // "não estou editando mais nenhum curso"
                >
                    ×
                </button>
                <h1>Editar curso</h1>
                <form
                    onSubmit={saveEdit}
                    style={{
                        border: 0,
                        boxShadow: 'none',
                        padding: 0,
                        marginTop: '20px'
                    }}
                >
                    <label className="full">
                        Nome
                        <input
                            value={editingCourse.nome || ''}
                            onChange={e =>
                                setEditingCourse({
                                    ...editingCourse, //mantém os outros dados do curso e altera somente o nome
                                    nome: e.target.value 
                                })
                            }
                            required
                        />
                    </label>
                    <label className="full">
                        Descrição
                        <textarea
                            value={editingCourse.descricao || ''}
                            onChange={e =>
                                setEditingCourse({
                                    ...editingCourse,
                                    descricao: e.target.value
                                })
                            }
                        />
                    </label>
                    <button type="submit">Salvar alterações</button>
                </form>
            </section>
        </div>
    );
}
