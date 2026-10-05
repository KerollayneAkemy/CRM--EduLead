import React from 'react';
// Este arquivo é responsável exclusivamente pela renderização visual da Seção de Dados Pessoais
export default function LeadFormPersonalSection({ input }) {
    return (
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
    );
}
