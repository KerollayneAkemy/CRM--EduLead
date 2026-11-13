import { useEffect, useState } from 'react';
import { api } from '../api';

const suggestions = [
    'O que faz cada módulo?',
    'Como funciona o funil?',
    'Como cadastro um interessado?',
    'Como registro uma interação?',
    'Quem pode administrar cursos?',
    'Como funcionam os anexos?',
    'Qual é a diferença entre gestor e atendente?'
];

export default function Assistant({ notice }) {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [available, setAvailable] = useState(null);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        api('/assistente/status').then(result => setAvailable(result.disponivel)).catch(error => notice(error.message));
    }, []);

    async function ask(event) {
        event.preventDefault();
        if (!question.trim()) return;
        setBusy(true);
        try {
            const result = await api('/assistente', { method: 'POST', body: JSON.stringify({ pergunta: question }) });
            setAnswer(result.resposta);
        } catch (error) {
            notice(error.message);
        } finally {
            setBusy(false);
        }
    }

    return (
        <section className="assistant-page">
            <div className="assistant-hero">
                <div className="assistant-symbol">✦</div>
                <div><p>SUPORTE INTERNO</p><h1>Olá, como posso ajudar?</h1><span>Entenda o EduLead, o funil e os recursos disponíveis para sua rotina.</span></div>
            </div>
            {available === false ? <div className="assistant-unavailable">O assistente ainda não foi configurado pela equipe técnica.</div> : (
                <><div className="assistant-workspace">
                    <p className="assistant-caption">PERGUNTE AO ASSISTENTE</p>
                    <form className="assistant-form" onSubmit={ask}>
                        <textarea value={question} maxLength="1000" onChange={e => setQuestion(e.target.value)} placeholder="Ex.: Como acompanho os próximos contatos?" />
                        <button disabled={busy}>{busy ? 'Consultando...' : 'Enviar pergunta'} <span>→</span></button>
                    </form>
                    <div className="assistant-suggestions"><small>Sugestões rápidas</small>{suggestions.map(item => <button type="button" key={item} onClick={() => setQuestion(item)}>{item}</button>)}</div>
                </div>
                {answer && <article className="assistant-answer"><div className="assistant-answer-mark">✦</div><div><small>ASSISTENTE EDULEAD</small><h2>Resposta</h2><p>{answer}</p></div></article>}</>)}
        </section>
    );
}
