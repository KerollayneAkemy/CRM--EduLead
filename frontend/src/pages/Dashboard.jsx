import Chart from '../components/Chart';
import { label } from '../constants';

export default function Dashboard({ dash, leads, courses = [], nav }) {
    const metrics = [
        ['Interessados', dash.totalInteressados],
        ['Matrículas', dash.matriculas],
        ['Conversão', `${dash.taxaConversao || 0}%`],
        ['Tarefas pendentes', dash.tarefasPendentes]
    ];

    const getCourseName = lead => {
        if (!lead) return 'Sem curso';
        const course = lead.curso || lead.course;
        if (!course) {
            const id = lead.cursoId || lead.courseId;
            if (id) {
                const match = courses.find(item => item.id === +id);
                if (match?.nome) return match.nome;
            }
            return 'Sem curso';
        }
        if (typeof course === 'string') return course;
        if (typeof course === 'object') {
            if (course.nome) return course.nome;
            if (course.name) return course.name;
            if (course.id) {
                const match = courses.find(item => item.id === +course.id);
                if (match?.nome) return match.nome;
            }
        }
        if (typeof course === 'number') {
            const match = courses.find(item => item.id === course);
            if (match?.nome) return match.nome;
        }
        return 'Sem curso';
    };

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
                        <div
                            className="overview-row"
                            key={l.id}
                            style={{ gridTemplateColumns: '1.2fr 1fr 150px' }}
                        >
                            <b>{l.nome}</b>
                            <span
                                title={getCourseName(l)}
                                style={{ minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                            >
                                {getCourseName(l)}
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
