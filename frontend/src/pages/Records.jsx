import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { label } from '../constants';

export default function Records({ type, path, fields, notice, load }) {
    const [items, setItems] = useState([]);
    const [f, setF] = useState({});
    const [openMenuId, setOpenMenuId] = useState(null);
    const [editingCourse, setEditingCourse] = useState(null);

    const refresh = () => api(path).then(setItems);

    useEffect(() => {
        refresh();
    }, [path]);

    async function add(e) {
        e.preventDefault();

        try {
            await api(path, {
                method: 'POST',
                body: JSON.stringify(f)
            });

            setF({});
            refresh();
            if (load) load();
            notice('Cadastro realizado.');
        } catch (e) {
            notice(e.message);
        }
    }

    async function saveEdit(e) {
        e.preventDefault();
        if (!editingCourse || !editingCourse.nome.trim()) return;

        try {
            await api(`/cursos/${editingCourse.id}`, {
                method: 'PUT',
                body: JSON.stringify(editingCourse)
            });

            setEditingCourse(null);
            refresh();
            if (load) load();
            notice('Curso atualizado com sucesso.');
        } catch (e) {
            notice(e.message);
        }
    }

    async function archiveCourse(item) {
        try {
            await api(`/cursos/${item.id}`, {
                method: 'PUT',
                body: JSON.stringify({ ...item, ativo: false })
            });

            refresh();
            if (load) load();
            notice('Curso arquivado com sucesso.');
        } catch (e) {
            notice(e.message);
        }
    }

    async function removeCourse(item) {
        if (!window.confirm(`Deseja realmente excluir o curso "${item.nome}"?`)) return;

        try {
            await api(`/cursos/${item.id}`, {
                method: 'DELETE'
            });

            refresh();
            if (load) load();
            notice('Curso excluído.');
        } catch (e) {
            notice(e.message);
        }
    }

    const singular = type === 'Cursos' ? 'curso' : 'usuário';
    const activeItems = type === 'Cursos' ? items.filter(x => x.ativo !== false) : items;

    return (
        <section className="management-page">
            <div className="title-row">
                <div>
                    <p className="eyebrow">CONFIGURAÇÕES</p>
                    <h1>{type}</h1>
                    <p>
                        Gerencie os dados usados pela operação do
                        CRM.
                    </p>
                </div>
            </div>

            <div className="management-grid">
                <form className="side-form" onSubmit={add}>
                    <h2>Novo {singular}</h2>
                    <p>
                        Preencha os dados para disponibilizá-lo no
                        sistema.
                    </p>

                    {fields.map(k => (
                        <label key={k}>
                            {label(k)}
                            <input
                                type={
                                    k === 'senha'
                                        ? 'password'
                                        : k === 'email'
                                            ? 'email'
                                            : 'text'
                                }
                                value={f[k] || ''}
                                onChange={e =>
                                    setF({
                                        ...f,
                                        [k]: e.target.value
                                    })
                                }
                            />
                        </label>
                    ))}

                    <button>Salvar {singular}</button>
                </form>

                <section className="records-panel">
                    <div className="records-panel-head">
                        <div>
                            <h2>{type} cadastrados</h2>
                            <span>
                                {activeItems.length} registro(s)
                            </span>
                        </div>
                    </div>

                    <div className="record-cards">
                        {activeItems.map(x => (
                            <article
                                className="record-card"
                                key={x.id}
                                style={{ position: 'relative' }}
                            >
                                <span className="record-avatar">
                                    {x.nome?.slice(0, 1)}
                                </span>

                                <div>
                                    <b>{x.nome}</b>
                                    <small>
                                        {x.email ||
                                            x.descricao ||
                                            x.cargo ||
                                            'Ativo'}
                                    </small>
                                </div>

                                {type === 'Cursos' ? (
                                    <div style={{ position: 'relative', marginLeft: 'auto' }}>
                                        <button
                                            type="button"
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                fontSize: '18px',
                                                cursor: 'pointer',
                                                padding: '4px 8px',
                                                color: '#536176'
                                            }}
                                            onClick={() =>
                                                setOpenMenuId(openMenuId === x.id ? null : x.id)
                                            }
                                        >
                                            ⋮
                                        </button>
                                        {openMenuId === x.id && (
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    right: 0,
                                                    top: '100%',
                                                    background: '#fff',
                                                    border: '1px solid #e6ebf2',
                                                    borderRadius: '8px',
                                                    boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
                                                    zIndex: 10,
                                                    minWidth: '130px',
                                                    overflow: 'hidden'
                                                }}
                                            >
                                                <button
                                                    type="button"
                                                    style={{
                                                        display: 'block',
                                                        width: '100%',
                                                        padding: '9px 12px',
                                                        background: 'none',
                                                        border: 'none',
                                                        textAlign: 'left',
                                                        cursor: 'pointer',
                                                        fontSize: '13px',
                                                        color: '#1c3154'
                                                    }}
                                                    onClick={() => {
                                                        setOpenMenuId(null);
                                                        setEditingCourse({
                                                            id: x.id,
                                                            nome: x.nome,
                                                            descricao: x.descricao || '',
                                                            ativo: x.ativo
                                                        });
                                                    }}
                                                >
                                                    ✏️ Editar
                                                </button>
                                                <button
                                                    type="button"
                                                    style={{
                                                        display: 'block',
                                                        width: '100%',
                                                        padding: '9px 12px',
                                                        background: 'none',
                                                        border: 'none',
                                                        textAlign: 'left',
                                                        cursor: 'pointer',
                                                        fontSize: '13px',
                                                        color: '#1c3154'
                                                    }}
                                                    onClick={() => {
                                                        setOpenMenuId(null);
                                                        archiveCourse(x);
                                                    }}
                                                >
                                                    📦 Arquivar
                                                </button>
                                                <button
                                                    type="button"
                                                    style={{
                                                        display: 'block',
                                                        width: '100%',
                                                        padding: '9px 12px',
                                                        background: 'none',
                                                        border: 'none',
                                                        textAlign: 'left',
                                                        cursor: 'pointer',
                                                        fontSize: '13px',
                                                        color: '#c84b57'
                                                    }}
                                                    onClick={() => {
                                                        setOpenMenuId(null);
                                                        removeCourse(x);
                                                    }}
                                                >
                                                    🗑️ Excluir
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <em>
                                        {x.ativo === false
                                            ? 'Inativo'
                                            : 'Ativo'}
                                    </em>
                                )}
                            </article>
                        ))}

                        {!activeItems.length && (
                            <div className="empty-state">
                                Nenhum registro cadastrado ainda.
                            </div>
                        )}
                    </div>
                </section>
            </div>

            {editingCourse && (
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
            )}
        </section>
    );
}
