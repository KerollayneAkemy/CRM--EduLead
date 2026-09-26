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

    async function toggleUserActive(item) {
        try {
            await api(`/usuarios/${item.id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    ...item,
                    ativo: item.ativo === false
                })
            });

            refresh();
            if (load) load();
            notice(
                item.ativo === false
                    ? 'Usuário ativado com sucesso.'
                    : 'Usuário desativado com sucesso.'
            );
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
                            >
                                <span className="record-avatar">
                                    {x.nome?.slice(0, 1)}
                                </span>

                                <div className="record-details">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                        <b>{x.nome}</b>
                                        {type === 'Cursos' && (
                                            <span className="badge-active-status">Ativo</span>
                                        )}
                                    </div>
                                    <small>
                                        {x.email ||
                                            x.descricao ||
                                            x.cargo ||
                                            'Sem descrição'}
                                    </small>
                                </div>

                                {type === 'Cursos' ? (
                                    <div className="record-actions-wrapper">
                                        <button
                                            type="button"
                                            className="btn-menu-trigger"
                                            onClick={() =>
                                                setOpenMenuId(openMenuId === x.id ? null : x.id)
                                            }
                                            title="Opções"
                                        >
                                            ⋮
                                        </button>
                                        {openMenuId === x.id && (
                                            <div className="record-dropdown-menu">
                                                <button
                                                    type="button"
                                                    className="dropdown-item"
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
                                                    className="dropdown-item"
                                                    onClick={() => {
                                                        setOpenMenuId(null);
                                                        archiveCourse(x);
                                                    }}
                                                >
                                                    📦 Arquivar
                                                </button>
                                                <button
                                                    type="button"
                                                    className="dropdown-item danger"
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
                                ) : type === 'Usuários' ? (
                                    <div className="record-user-actions">
                                        <em>
                                            {x.ativo === false
                                                ? 'Inativo'
                                                : 'Ativo'}
                                        </em>
                                        <button
                                            type="button"
                                            className={
                                                x.ativo === false
                                                    ? 'activate-user'
                                                    : 'deactivate-user'
                                            }
                                            onClick={() => toggleUserActive(x)}
                                        >
                                            {x.ativo === false
                                                ? 'Ativar'
                                                : 'Desativar'}
                                        </button>
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
