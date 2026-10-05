import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { label } from '../constants';
// Modal com a ficha detalhada de um interessado. Permite visualizar informações de contato, 
// etapas e adicionar histórico de interações (ex.: "Liguei e cliente pediu retorno amanhã").
export default function Profile({ lead, close, notice }) { // Criando Profile. Lead = é o interessado, close = Função para fechar o modal
    const [history, setHistory] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [note, setNote] = useState(''); // Esse estado guarda o texto que o usuário está digitando no campo: Descreva o contato realizado
    // 3 UseState

    const refresh = async () => {
        setHistory(
            await api(`/interessados/${lead.id}/interacoes`) // fazer requisição
        );

        setTasks(
            await api(`/interessados/${lead.id}/tarefas`) // buscar tarefas do interessado
        );
    };

    useEffect(() => { // O useEffect executa uma função quando determinadas condições acontecem
        refresh();
    }, [lead.id]); //Execute esse efeito quando o lead.id mudar
    async function add(e) { //Registrar uma nova interação
        e.preventDefault();  // Deixa o react cuidar da questão de carregamento da página

        if (!note.trim()) return; // verifica se existe uma nota

        try { //Tentando executar esse código
            await api('/interacoes', {
                method: 'POST',
                body: JSON.stringify({ //Preparando dados que irão para o back //O JSON.stringify transforma o objeto JavaScript em JSON para enviar os dados no corpo da requisição HTTP
                    tipo: 'CONTATO',
                    descricao: note,
                    interessado: { id: lead.id }
                })
            });

            setNote(''); // Limpa o campo de texto
            refresh();
            notice('Interação registrada.');
        } catch (e) { // se alguma coisa der errado no try , vem para o catch
            notice(e.message);
        }
    }

    return (
        <div className="modal">
            <section>
                <button className="close" onClick={close}>
                    ×
                </button>

                <h1>{lead.nome}</h1>

                <p>
                    {lead.curso?.nome || 'Curso não definido'} ·{' '}
                    {lead.telefone} · {lead.email || 'Sem e-mail'}
                </p>

                <div className="profile-meta">
                    <span>
                        Etapa: <b>{label(lead.etapa)}</b>
                    </span>

                    <span>
                        Origem: <b>{lead.origem || '—'}</b>
                    </span>

                    <span>
                        Próximo contato:{' '}
                        <b>
                            {lead.proximoContato || 'Não agendado'}
                        </b>
                    </span>
                </div>

                <h2>Histórico de contatos</h2>

                <form onSubmit={add} className="note">
                    <input
                        placeholder="Descreva o contato realizado"
                        value={note}
                        onChange={e => setNote(e.target.value)}
                    />
                    <button>Registrar</button>
                </form>

                {history.length ? ( // verificando se o array history possui elementos.
                    history.map(h => ( // O React precisa identificar cada elemento de uma lista
                        <article className="timeline" key={h.id}> 
                            <b>{h.tipo}</b>
                            <p>{h.descricao}</p>
                            <small>
                                {new Date(h.data).toLocaleString(
                                    'pt-BR'
                                )}
                            </small>
                        </article>
                    ))
                ) : (
                    <p>Nenhuma interação registrada.</p>
                )}

                <h2>Tarefas deste interessado</h2>

                {tasks.map(t => ( // t = tarefa atual
                    <p key={t.id}>
                        • {t.titulo} — {t.status}
                    </p>
                ))}
            </section>
        </div>
    );
}
