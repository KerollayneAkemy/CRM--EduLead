export const STAGES = [
    'NOVO_INTERESSADO',
    'PRIMEIRO_CONTATO',
    'AGUARDANDO_RETORNO',
    'VISITA_AULA_EXPERIMENTAL',
    'DOCUMENTACAO',
    'MATRICULA_REALIZADA',
    'DESISTIU'
];

export const label = x =>
    (x || '—')
        .replaceAll('_', ' ')
        .toLowerCase()
        .replace(/\b\w/g, c => c.toUpperCase());

export const phoneMask = value => {
    const d = value.replace(/\D/g, '').slice(0, 11);
    return d.replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
};
