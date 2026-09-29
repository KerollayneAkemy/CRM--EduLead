import React from 'react';

export default function EditCourseModal({ editingCourse, setEditingCourse, saveEdit }) {
    if (!editingCourse) return null;

    return (
        <div className="modal">
            <section>
                <button
                    className="close"
                    onClick={() => setEditingCourse(null)}
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
                                    ...editingCourse,
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
