import React, { useEffect, useState } from 'react';
import { api } from '../api';

export default function ArchivedCourses({ notice, load }) {
    const [items, setItems] = useState([]);

    const refresh = () =>
        api('/cursos').then(data =>
            setItems(data.filter(x => x.ativo === false))
        );

    useEffect(() => {
        refresh();
    }, []);

    async function restoreCourse(item) {
        try {
            await api(`/cursos/${item.id}`, {
                method: 'PUT',
                body: JSON.stringify({ ...item, ativo: true })
            });

            refresh();
            if (load) load();
            notice('Curso restaurado.');
        } catch (e) {
            notice(e.message);
        }
    }

    async function removePermanently(item) {
        if (
            !window.confirm(
                `Deseja realmente excluir definitivamente o curso "${item.nome}"? Essa ação não pode ser desfeita.`
            )
        )
            return;

        try {
            await api(`/cursos/${item.id}`, {
                method: 'DELETE'
            });

            refresh();
            if (load) load();
            notice('Curso excluído definitivamente.');
        } catch (e) {
            notice(e.message);
        }
    }

    return (
        <section className="management-page">
            <div className="title-row">
                <div>
                    <p className="eyebrow">CONFIGURAÇÕES</p>
                    <h1>Cursos arquivados</h1>
                    <p>
                        Cursos desativados da operação. Você pode restaurá-los
                        ou excluí-los definitivamente.
                    </p>
                </div>
            </div>

            <section className="records-panel" style={{ marginTop: '20px' }}>
                <div className="records-panel-head">
                    <div>
                        <h2>Cursos no arquivo</h2>
                        <span>{items.length} registro(s) arquivado(s)</span>
                    </div>
                </div>

                <div className="record-cards">
                    {items.map(x => (
                        <article
                            className="record-card archived-card"
                            key={x.id}
                        >
                            <span className="record-avatar archived">
                                📦
                            </span>

                            <div className="record-details">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                    <b>{x.nome}</b>
                                    <span className="badge-archived-tag">Arquivado</span>
                                </div>
                                <small>
                                    {x.descricao || 'Sem descrição'}
                                </small>
                            </div>

                            <div className="archived-actions-group">
                                <button
                                    type="button"
                                    className="btn-restore-course"
                                    onClick={() => restoreCourse(x)}
                                    title="Restaurar curso"
                                >
                                    ↩️ Restaurar
                                </button>
                                <button
                                    type="button"
                                    className="btn-delete-course"
                                    onClick={() => removePermanently(x)}
                                    title="Excluir definitivamente"
                                >
                                    🗑️ Excluir
                                </button>
                            </div>
                        </article>
                    ))}

                    {!items.length && (
                        <div className="empty-state">
                            Nenhum curso arquivado no momento.
                        </div>
                    )}
                </div>
            </section>
        </section>
    );
}
