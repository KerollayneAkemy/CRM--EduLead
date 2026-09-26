import React, { useState } from 'react';
import { api } from '../api';
import { STAGES, label, phoneMask } from '../constants';

export default function LeadForm({ courses, users, load, notice, nav }) {
    const [f, setF] = useState({
        etapa: STAGES[0],
        origem: 'Instagram'
    });

    const [busy, setBusy] = useState(false);

    const input = (k, type = 'text') => (
        <label>
            {label(k)}
            <input
                type={type}
                inputMode={k === 'telefone' ? 'tel' : undefined}
                placeholder={
                    k === 'telefone'
                        ? '(00) 00000-0000'
                        : undefined
                }
                value={f[k] || ''}
                onChange={e =>
                    setF({
                        ...f,
                        [k]:
                            k === 'telefone'
                                ? phoneMask(e.target.value)
                                : e.target.value
                    })
                }
            />
        </label>
    );

    async function submit(e) {
        e.preventDefault();

        if (!f.nome || !f.telefone) {
            return notice('Nome e telefone são obrigatórios.');
        }

        setBusy(true);

        try {
            await api('/interessados', {
                method: 'POST',
                body: JSON.stringify(f)
            });

            notice('Interessado cadastrado com sucesso.');
            await load();
            nav('Interessados');
        } catch (e) {
            notice(e.message);
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="lead-form-page">
            <div className="title-row">
                <div>
                    <p className="eyebrow">CADASTRO DE PROSPECT</p>
                    <h1>Novo interessado</h1>
                    <p>Preencha as informações abaixo para registrar um novo interessado no sistema.</p>
                </div>
            </div>

            <form onSubmit={submit} className="lead-form-body">
                {/* Seção 1: Dados Pessoais */}
                <div className="form-card-section">
                    <div className="form-card-header">
                        <span className="form-card-icon">👤</span>
                        <div>
                            <h2>Dados pessoais</h2>
                            <small>Informações básicas de identificação e contato do interessado.</small>
                        </div>
                    </div>

                    <div className="form-grid-2">
                        {input('nome')}
                        {input('telefone')}
                        <div className="full">
                            {input('email', 'email')}
                        </div>
                    </div>
                </div>

                {/* Seção 2: Curso e Atendimento */}
                <div className="form-card-section">
                    <div className="form-card-header">
                        <span className="form-card-icon">🎓</span>
                        <div>
                            <h2>Curso e atendimento</h2>
                            <small>Defina o curso de interesse, origem da captação e atendente responsável.</small>
                        </div>
                    </div>

                    <div className="form-grid-2">
                        <label>
                            Curso de interesse
                            <select
                                value={f.curso?.id || ''}
                                onChange={e =>
                                    setF({
                                        ...f,
                                        curso: e.target.value
                                            ? { id: +e.target.value }
                                            : null
                                    })
                                }
                            >
                                <option value="">Selecione um curso</option>
                                {courses
                                    .filter(c => c.ativo !== false)
                                    .map(c => (
                                        <option key={c.id} value={c.id}>
                                            {c.nome}
                                        </option>
                                    ))}
                            </select>
                        </label>

                        <label>
                            Turno desejado
                            <select
                                value={f.turno || ''}
                                onChange={e =>
                                    setF({ ...f, turno: e.target.value })
                                }
                            >
                                <option value="">Selecione o turno</option>
                                <option>Matutino</option>
                                <option>Vespertino</option>
                                <option>Noturno</option>
                            </select>
                        </label>

                        <label>
                            Origem do contato
                            <select
                                value={f.origem || ''}
                                onChange={e =>
                                    setF({ ...f, origem: e.target.value })
                                }
                            >
                                {[
                                    'Instagram',
                                    'WhatsApp',
                                    'Indicação',
                                    'Site',
                                    'Visita presencial',
                                    'Evento',
                                    'Outro'
                                ].map(x => (
                                    <option key={x}>{x}</option>
                                ))}
                            </select>
                        </label>

                        <label>
                            Atendente responsável
                            <select
                                value={f.responsavel?.id || ''}
                                onChange={e =>
                                    setF({
                                        ...f,
                                        responsavel: e.target.value
                                            ? { id: +e.target.value }
                                            : null
                                    })
                                }
                            >
                                <option value="">Não atribuído</option>
                                {users.map(u => (
                                    <option key={u.id} value={u.id}>
                                        {u.nome}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>
                </div>

                {/* Seção 3: Agendamento e Observações */}
                <div className="form-card-section">
                    <div className="form-card-header">
                        <span className="form-card-icon">📅</span>
                        <div>
                            <h2>Agendamento e observações</h2>
                            <small>Programe o próximo retorno e registre notas importantes.</small>
                        </div>
                    </div>

                    <div className="form-grid-2">
                        <label className="full">
                            Próximo contato
                            <input
                                type="date"
                                value={f.proximoContato || ''}
                                onChange={e =>
                                    setF({
                                        ...f,
                                        proximoContato: e.target.value
                                    })
                                }
                            />
                        </label>

                        <label className="full">
                            Observações
                            <textarea
                                value={f.observacoes || ''}
                                onChange={e =>
                                    setF({
                                        ...f,
                                        observacoes: e.target.value
                                    })
                                }
                                placeholder="Descreva detalhes relevantes sobre a negociação ou perfil do interessado..."
                            />
                        </label>
                    </div>
                </div>

                {/* Área do Botão de Salvamento */}
                <div className="form-footer-actions">
                    <button type="submit" className="btn-save-lead" disabled={busy}>
                        {busy ? 'Salvando...' : 'Salvar interessado'}
                    </button>
                </div>
            </form>
        </div>
    );
}
