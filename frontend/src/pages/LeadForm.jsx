//cadastrar um novo interessado no EduLead

import React, { useState } from 'react';
import { api } from '../api';
import { STAGES, label, phoneMask } from '../constants';
import LeadFormPersonalSection from '../components/lead-form/LeadFormPersonalSection';
import LeadFormCourseSection from '../components/lead-form/LeadFormCourseSection';
import LeadFormScheduleSection from '../components/lead-form/LeadFormScheduleSection';

export default function LeadForm({ courses, users, load, notice, nav }) {
    const [f, setF] = useState({ // f quarda os dados atuais do formulário setF altera os dados
        etapa: STAGES[0],
        origem: 'Instagram' // instagram origem inicial
    });

    const [busy, setBusy] = useState(false); // busy verifica se esta salvando o cadastro

    const input = (k, type = 'text') => ( // k = qual campo esta sendo criado
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
                value={f[k] || ''} // k diz qual propriedade queremos , se n existir usa string vazia
                onChange={e => // qnd o user altera o campo
                    setF({
                        ...f, // mantem os dados que ja estao no forms
                        [k]: // atualizar o campo que o nome está dentro de k
                            k === 'telefone'
                                ? phoneMask(e.target.value)
                                : e.target.value // é oq a pessoa digitou
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
                body: JSON.stringify(f) // pega os dados do formulario e transforma em JSON p o back
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
                <LeadFormPersonalSection input={input} />
                <LeadFormCourseSection f={f} setF={setF} courses={courses} users={users} />
                <LeadFormScheduleSection f={f} setF={setF} />

                <div className="form-footer-actions">
                    <button type="submit" className="btn-save-lead" disabled={busy}>
                        {busy ? 'Salvando...' : 'Salvar interessado'}
                    </button>
                </div>
            </form>
        </div>
    );
}
