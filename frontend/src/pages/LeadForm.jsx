import React, { useState } from 'react';
import { api } from '../api';
import { STAGES, label, phoneMask } from '../constants';
import LeadFormPersonalSection from '../components/lead-form/LeadFormPersonalSection';
import LeadFormCourseSection from '../components/lead-form/LeadFormCourseSection';
import LeadFormScheduleSection from '../components/lead-form/LeadFormScheduleSection';

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
