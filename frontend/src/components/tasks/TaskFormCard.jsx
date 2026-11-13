
export default function TaskFormCard({ f, setF, add, leads }) {
    return (
        <section className="task-form-card">
            <div className="task-form-heading">
                <div className="task-form-icon">✓</div>
                <div><h2>Nova tarefa</h2><p>Organize um próximo passo para não perder nenhum acompanhamento.</p></div>
            </div>

            <form onSubmit={add}>
                <label className="full">
                    Título da tarefa
                    <input placeholder="Ex.: Ligar para confirmar presença" value={f.titulo || ''} onChange={e => setF({ ...f, titulo: e.target.value })} />
                </label>

                <label>
                    Prazo
                    <input type="date" value={f.prazo || ''} onChange={e => setF({ ...f, prazo: e.target.value })} />
                </label>

                <label>
                    Prioridade
                    <select value={f.prioridade || 'NORMAL'} onChange={e => setF({ ...f, prioridade: e.target.value })}>
                        <option value="BAIXA">Baixa</option>
                        <option value="NORMAL">Normal</option>
                        <option value="ALTA">Alta</option>
                    </select>
                </label>

                <label className="full">
                    Interessado relacionado
                    <select value={f.interessado?.id || ''} onChange={e => setF({ ...f, interessado: e.target.value ? { id: +e.target.value } : null })}>
                        <option value="">Sem vínculo</option>
                        {leads.map(l => <option key={l.id} value={l.id}>{l.nome}</option>)}
                    </select>
                </label>

                <label className="full">
                    Descrição <small>Opcional</small>
                    <textarea placeholder="Adicione observações, contexto ou detalhes para o atendimento..." value={f.descricao || ''} onChange={e => setF({ ...f, descricao: e.target.value })} />
                </label>

                <button>Criar tarefa <span>→</span></button>
            </form>
        </section>
    );
}
