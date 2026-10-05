//serve principalmente para padronizar nomes/status que aparecem na tela e para formatar telefone.
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

export const label = x => { // recebe um valor e decide como ele deve aparecer na tela
    if (!x) return '—'; //se não tiver valor irá aparecer isso
    if (STAGE_LABELS[x]) return STAGE_LABELS[x];
    if (FIELD_LABELS[x]) return FIELD_LABELS[x]; //Agora ele verifica se x é um nome de campo.
    if (STAGES.includes(x) || /^[A-Z0-9_]+$/.test(x)) { // Aqui ele verifica se x está entre os estágios ou se parece com um texto técnico escrito em maiúsculas e _.
        return x
            .split('_') // separa as palavras
            .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()) // organização
            .join(' '); // junta
    }
    return x;
};

export const phoneMask = value => {
    const d = value.replace(/\D/g, '').slice(0, 11);
    return d.replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2'); //mascara de numero de telefone
};
