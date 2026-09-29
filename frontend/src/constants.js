export const STAGES = [
    'NOVO_INTERESSADO',
    'PRIMEIRO_CONTATO',
    'AGUARDANDO_RETORNO',
    'VISITA_AULA_EXPERIMENTAL',
    'DOCUMENTACAO',
    'MATRICULA_REALIZADA',
    'DESISTIU'
];

const FIELD_LABELS = {
    nome: 'Nome',
    telefone: 'Telefone',
    email: 'E-mail',
    descricao: 'Descrição',
    senha: 'Senha',
    cargo: 'Cargo'
};

const STAGE_LABELS = {
    NOVO_INTERESSADO: 'Novo Interessado',
    PRIMEIRO_CONTATO: 'Primeiro Contato',
    AGUARDANDO_RETORNO: 'Aguardando Retorno',
    VISITA_AULA_EXPERIMENTAL: 'Visita / Aula Experimental',
    DOCUMENTACAO: 'Documentação',
    MATRICULA_REALIZADA: 'Matrícula Realizada',
    DESISTIU: 'Desistiu'
};

export const label = x => {
    if (!x) return '—';
    if (STAGE_LABELS[x]) return STAGE_LABELS[x];
    if (FIELD_LABELS[x]) return FIELD_LABELS[x];
    if (STAGES.includes(x) || /^[A-Z0-9_]+$/.test(x)) {
        return x
            .split('_')
            .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join(' ');
    }
    return x;
};

export const phoneMask = value => {
    const d = value.replace(/\D/g, '').slice(0, 11);
    return d.replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
};
