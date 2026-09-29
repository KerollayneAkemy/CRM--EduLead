import React, { useEffect, useState } from 'react';
import { api } from '../api';
import RecordSideForm from '../components/records/RecordSideForm';
import RecordCard from '../components/records/RecordCard';
import EditCourseModal from '../components/records/EditCourseModal';

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
                <RecordSideForm
                    singular={singular}
                    fields={fields}
                    f={f}
                    setF={setF}
                    add={add}
                />

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
                            <RecordCard
                                key={x.id}
                                x={x}
                                type={type}
                                openMenuId={openMenuId}
                                setOpenMenuId={setOpenMenuId}
                                setEditingCourse={setEditingCourse}
                                archiveCourse={archiveCourse}
                                removeCourse={removeCourse}
                                toggleUserActive={toggleUserActive}
                            />
                        ))}

                        {!activeItems.length && (
                            <div className="empty-state">
                                Nenhum registro cadastrado ainda.
                            </div>
                        )}
                    </div>
                </section>
            </div>

            <EditCourseModal
                editingCourse={editingCourse}
                setEditingCourse={setEditingCourse}
                saveEdit={saveEdit}
            />
        </section>
    );
}
