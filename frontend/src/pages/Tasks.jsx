import React, { useEffect, useState } from 'react';
import { api } from '../api';
import TaskFormCard from '../components/tasks/TaskFormCard';
import TaskItem from '../components/tasks/TaskItem';
import TaskDeleteModal from '../components/tasks/TaskDeleteModal';
// componente principal da página de tarefas
export default function Tasks({ leads, notice }) {
    const [tasks, setTasks] = useState([]);
    const [f, setF] = useState({});
    const [taskToDelete, setTaskToDelete] = useState(null);

    const refresh = () =>
        api('/tarefas').then(setTasks);

    useEffect(() => {
        refresh();
    }, []);

    async function add(e) {
        e.preventDefault();

        try {
            await api('/tarefas', {
                method: 'POST',
                body: JSON.stringify(f)
            });

            setF({});
            refresh();
            notice('Tarefa criada.');
        } catch (e) {
            notice(e.message);
        }
    }

    async function done(id) {
        try {
            await api(`/tarefas/${id}/concluir`, {
                method: 'PATCH'
            });

            refresh();
            notice('Tarefa concluída.');
        } catch (e) {
            notice(e.message);
        }
    }

    async function removeTask(id) {
        try {
            await api(`/tarefas/${id}`, {
                method: 'DELETE'
            });

            setTaskToDelete(null);
            refresh();
            notice('Tarefa excluída com sucesso.');
        } catch (e) {
            notice(e.message);
        }
    }

    return (
        <div className="tasks-container">
            <div className="title-row">
                <div>
                    <p className="eyebrow">ORGANIZAÇÃO E AGENDA</p>
                    <h1>Tarefas e lembretes</h1>
                    <p>Acompanhe e gerencie pendências da equipe de captação.</p>
                </div>
            </div>

            <TaskFormCard f={f} setF={setF} add={add} leads={leads} />

            <div className="tasks-list">
                {tasks.map(t => (
                    <TaskItem key={t.id} t={t} done={done} setTaskToDelete={setTaskToDelete} />
                ))}

                {!tasks.length && (
                    <div className="empty-state" style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid var(--border)' }}>
                        Nenhuma tarefa cadastrada até o momento.
                    </div>
                )}
            </div>

            <TaskDeleteModal
                taskToDelete={taskToDelete}
                setTaskToDelete={setTaskToDelete}
                removeTask={removeTask}
            />
        </div>
    );
}
