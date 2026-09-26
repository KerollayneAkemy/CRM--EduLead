import React from 'react';
import Chart from '../components/Chart';
import { label } from '../constants';

export default function Dashboard({ dash, leads, nav }) {
    const metrics = [
        ['Interessados', dash.totalInteressados],
        ['Matrículas', dash.matriculas],
        ['Conversão', `${dash.taxaConversao || 0}%`],
        ['Tarefas pendentes', dash.tarefasPendentes]
    ];

    return (
        <>
            <div className="title-row">
                <div>
                    <p className="eyebrow">CENTRAL DE OPERAÇÕES</p>
                    <h1>Dashboard</h1>
                    <p>Visão geral da captação de alunos.</p>
                </div>

                <button onClick={() => nav('Novo interessado')}>
                    + Novo interessado
                </button>
            </div>

            <section className="cards">
                {metrics.map(([n, v]) => (
                    <article key={n}>
                        <small>{n}</small>
                        <h2>{v ?? 0}</h2>
                    </article>
                ))}
            </section>

            <section className="quick-actions">
                <button onClick={() => nav('Novo interessado')}>
                    <span>＋</span>
                    <b>Novo interessado</b>
                    <small>Registre um novo contato.</small>
                </button>

                <button onClick={() => nav('Funil')}>
                    <span>↗</span>
                    <b>Atualizar funil</b>
                    <small>Avance oportunidades.</small>
                </button>

                <button onClick={() => nav('Tarefas')}>
                    <span>✓</span>
                    <b>Organizar agenda</b>
                    <small>Veja suas pendências.</small>
                </button>
            </section>

            <section className="insights">
                <Chart
                    title="Interessados por etapa"
                    data={dash.porEtapa}
                />
                <Chart
                    title="Origem dos contatos"
                    data={dash.porOrigem}
                />
                <Chart
                    title="Cursos mais procurados"
                    data={dash.porCurso}
                />
            </section>

            <section className="overview">
                <h2>Contatos recentes</h2>

                {leads
                    .slice(-5)
                    .reverse()
                    .map(l => (
                        <div className="overview-row" key={l.id}>
                            <b>{l.nome}</b>
                            <span>
                                {l.curso?.nome || 'Sem curso'}
                            </span>
                            <em>{label(l.etapa)}</em>
                        </div>
                    ))}

                {!leads.length && (
                    <p>Nenhum interessado cadastrado.</p>
                )}
            </section>
        </>
    );
}
