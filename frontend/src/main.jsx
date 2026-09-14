import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';
import { api } from './api';

import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Profile from './components/Profile';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Pipeline from './pages/Pipeline';
import LeadList from './pages/LeadList';
import LeadForm from './pages/LeadForm';
import Records from './pages/Records';
import ArchivedCourses from './pages/ArchivedCourses';
import Tasks from './pages/Tasks';

function App() {
    const [session, setSession] = useState(() =>
        JSON.parse(localStorage.getItem('edulead-session') || 'null')
    );

    return session ? (
        <CRM
            logout={() => {
                localStorage.removeItem('edulead-session');
                setSession(null);
            }}
        />
    ) : (
        <Login onLogin={setSession} />
    );
}

function CRM({ logout }) {
    const [page, setPage] = useState('Dashboard');
    const [menuOpen, setMenuOpen] = useState(false);
    const [leads, setLeads] = useState([]);
    const [courses, setCourses] = useState([]);
    const [users, setUsers] = useState([]);
    const [dash, setDash] = useState({});
    const [toast, setToast] = useState('');
    const [selected, setSelected] = useState(null);

    const notice = m => {
        setToast(m);
        setTimeout(() => setToast(''), 3000);
    };

    const load = async () => {
        try {
            const [a, b, c, d] = await Promise.all([
                api('/interessados'),
                api('/cursos'),
                api('/usuarios'),
                api('/dashboard')
            ]);

            setLeads(a);
            setCourses(b);
            setUsers(c);
            setDash(d);
        } catch (e) {
            notice(e.message);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const nav = p => {
        setSelected(null);
        setPage(p);
    };

    const common = {
        leads,
        courses,
        users,
        load,
        notice,
        nav
    };

    return (
        <>
            <Header logout={logout} onToggleMenu={() => setMenuOpen(!menuOpen)} />

            <Sidebar
                page={page}
                nav={nav}
                isOpen={menuOpen}
                onClose={() => setMenuOpen(false)}
            />

            <main>
                {page === 'Dashboard' && (
                    <Dashboard dash={dash} leads={leads} nav={nav} />
                )}

                {page === 'Funil' && <Pipeline {...common} />}

                {page === 'Interessados' && (
                    <LeadList {...common} open={setSelected} />
                )}

                {page === 'Novo interessado' && <LeadForm {...common} />}

                {page === 'Cursos' && (
                    <Records
                        {...common}
                        type="Cursos"
                        path="/cursos"
                        fields={['nome', 'descricao']}
                    />
                )}

                {page === 'Cursos arquivados' && (
                    <ArchivedCourses {...common} />
                )}

                {page === 'Usuários' && (
                    <Records
                        {...common}
                        type="Usuários"
                        path="/usuarios"
                        fields={['nome', 'email', 'senha', 'cargo']}
                    />
                )}

                {page === 'Tarefas' && <Tasks {...common} />}

                {selected && (
                    <Profile
                        lead={selected}
                        close={() => setSelected(null)}
                        notice={notice}
                    />
                )}
            </main>

            {toast && <div className="toast">✓ {toast}</div>}
        </>
    );
}

createRoot(document.getElementById('root')).render(<App />);