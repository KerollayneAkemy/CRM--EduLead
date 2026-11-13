import logoImg from '../img/EduLead - Logo.jpeg';

const steps = [
    ['01', 'Cadastre o interesse', 'Registre o potencial aluno, curso desejado e a origem do contato.'],
    ['02', 'Acompanhe o contato', 'Anote interações e programe retornos para não perder oportunidades.'],
    ['03', 'Conduza pelo funil', 'Atualize a etapa conforme cada conversa evolui até a matrícula.'],
    ['04', 'Decida com clareza', 'Use tarefas e indicadores para organizar a rotina da equipe.']
];

const plans = [
    {
        name: 'Essencial',
        price: 'R$ 129',
        annual: 'R$ 1.393,20 / ano',
        audience: 'Para pequenas escolas e cursos livres.',
        users: 'Até 5 usuários ativos',
        items: ['Recursos principais do EduLead', 'Materiais de orientação', 'Suporte padrão por e-mail e WhatsApp em horário comercial']
    },
    {
        name: 'Profissional',
        price: 'R$ 249',
        annual: 'R$ 2.689,20 / ano',
        audience: 'Para instituições em crescimento.',
        users: 'Até 20 usuários ativos',
        items: ['Tudo do plano Essencial', 'Atendimento prioritário', 'Treinamento inicial online de até uma hora'],
        featured: true
    }
];

const SALES_WHATSAPP = '5569992490485';

export default function Presentation({ onBack }) {
    function contactSales(plan) {
        const message = `Olá! Tenho interesse em conhecer o plano ${plan.name} do EduLead.`;
        window.open(
            `https://wa.me/${SALES_WHATSAPP}?text=${encodeURIComponent(message)}`,
            '_blank',
            'noopener,noreferrer'
        );
    }

    return (
        <section className="presentation-page">
            <nav className="presentation-nav" aria-label="Apresentação EduLead">
                <div className="presentation-brand"><img src={logoImg} alt="EduLead" /><span>EduLead</span></div>
                <button className="presentation-login-link" onClick={onBack}>Já tenho acesso</button>
            </nav>

            <section className="presentation-hero">
                <div className="presentation-copy">
                    <span className="presentation-kicker">CRM EDUCACIONAL</span>
                    <h1>Mais clareza para transformar contatos em matrículas.</h1>
                    <p>O EduLead reúne pessoas, conversas, tarefas e indicadores em um único lugar para que sua equipe acompanhe cada oportunidade com atenção.</p>
                    <button className="presentation-primary" onClick={onBack}>Acessar o sistema <span>→</span></button>
                </div>
                <div className="presentation-preview" aria-label="Exemplo visual do funil de captação">
                    <div className="preview-topbar"><span></span><span></span><span></span></div>
                    <p className="preview-label">FUNIL DE CAPTAÇÃO</p>
                    <div className="preview-card active"><i></i><div><b>Luiza Santos</b><small>Interessada em Psicologia</small></div><em>Contato</em></div>
                    <div className="preview-card"><i></i><div><b>Gabriel Lima</b><small>Retorno agendado</small></div><em>Proposta</em></div>
                    <div className="preview-card"><i></i><div><b>Marina Costa</b><small>Documentação recebida</small></div><em>Matrícula</em></div>
                    <div className="preview-progress"><span></span></div>
                </div>
            </section>

            <section className="presentation-metrics" aria-label="Benefícios do EduLead">
                <article><strong>01</strong><span>Visão organizada<br />da captação</span></article>
                <article><strong>02</strong><span>Rotina guiada<br />por tarefas</span></article>
                <article><strong>03</strong><span>Decisões com<br />indicadores</span></article>
            </section>

            <section className="presentation-intro">
                <span className="presentation-kicker">O QUE GUIA O EDULEAD</span>
                <h2>Uma ferramenta simples para um relacionamento mais humano.</h2>
                <p>Quando informações ficam espalhadas, retornos importantes se perdem. O EduLead organiza o processo para que a tecnologia apoie — e não substitua — o cuidado de quem atende.</p>
            </section>

            <section className="presentation-values">
                <article><span>◌</span><h3>Organização</h3><p>Informações importantes acessíveis no momento certo.</p></article>
                <article><span>⌁</span><h3>Colaboração</h3><p>Uma equipe alinhada, com responsabilidades bem definidas.</p></article>
                <article><span>✦</span><h3>Confiança</h3><p>Dados protegidos e acompanhamento transparente.</p></article>
                <article><span>♡</span><h3>Proximidade</h3><p>Mais tempo para escutar e orientar cada estudante.</p></article>
            </section>

            <section className="presentation-flow">
                <div className="presentation-flow-heading"><span className="presentation-kicker">COMO COMEÇAR</span><h2>Um fluxo claro, do primeiro contato à matrícula.</h2></div>
                <div className="presentation-steps">
                    {steps.map(([number, title, description]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{description}</p></article>)}
                </div>
            </section>

            <section className="pricing-section" id="planos">
                    <div className="pricing-heading">
                        <span className="presentation-kicker">PLANOS EDULEAD</span>
                        <h2>Escolha o ritmo ideal para sua instituição.</h2>
                        <p>Todos os planos incluem as funcionalidades principais para organizar a captação de alunos.</p>
                    </div>
                    <div className="pricing-cards">
                        {plans.map(plan => (
                            <article className={plan.featured ? 'pricing-card featured' : 'pricing-card'} key={plan.name}>
                                {plan.featured && <span className="pricing-highlight">Mais escolhido</span>}
                                <h3>{plan.name}</h3>
                                <p className="pricing-audience">{plan.audience}</p>
                                <div className="pricing-price"><strong>{plan.price}</strong><span>/ mês</span></div>
                                <p className="pricing-annual">Anual com 10% de desconto: <b>{plan.annual}</b></p>
                                <span className="pricing-users">{plan.users}</span>
                                <ul>
                                    {plan.items.map(item => <li key={item}>✓ {item}</li>)}
                                </ul>
                                <button
                                    type="button"
                                    className={plan.featured ? 'presentation-primary plan-primary' : 'plan-secondary'}
                                    onClick={() => contactSales(plan)}
                                >
                                    Quero conhecer
                                </button>
                            </article>
                        ))}
                    </div>
                    <p className="pricing-note">Valores de lançamento sujeitos à validação comercial. Treinamentos adicionais podem ser contratados conforme necessidade.</p>
            </section>

            <section className="presentation-cta">
                <div><span className="presentation-kicker">PRONTO PARA COMEÇAR?</span><h2>Seu próximo acompanhamento começa aqui.</h2></div>
                <button className="presentation-primary light" onClick={onBack}>Entrar no EduLead <span>→</span></button>
            </section>
        </section>
    );
}
