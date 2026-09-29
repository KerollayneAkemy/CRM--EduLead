import React from 'react';

export default function TaskDeleteModal({ taskToDelete, setTaskToDelete, removeTask }) {
    if (!taskToDelete) return null;

    return (
        <div className="modal">
            <section style={{ maxWidth: '440px', textAlign: 'center' }}>
                <button className="close" onClick={() => setTaskToDelete(null)}>
                    ×
                </button>
                <h1 style={{ fontSize: '20px' }}>Excluir tarefa</h1>
                <p style={{ color: 'var(--muted)', margin: '14px 0 24px', fontSize: '14px' }}>
                    Tem certeza que deseja excluir a tarefa "{taskToDelete.titulo}"?
                </p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <button
                        type="button"
                        style={{
                            background: '#f1f5f9',
                            color: '#475569',
                            border: '1px solid #cbd5e1',
                            boxShadow: 'none',
                            padding: '10px 18px'
                        }}
                        onClick={() => setTaskToDelete(null)}
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        style={{
                            background: 'linear-gradient(135deg, #d94352, #b91c1c)',
                            boxShadow: '0 6px 16px rgba(217, 67, 82, 0.3)',
                            padding: '10px 18px'
                        }}
                        onClick={() => removeTask(taskToDelete.id)}
                    >
                        Excluir
                    </button>
                </div>
            </section>
        </div>
    );
}
