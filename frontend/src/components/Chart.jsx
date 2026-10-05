import React from 'react';
import { label } from '../constants';
// Gráfico de barras customizado criado em CSS/JSX puro 
// sem bibliotecas pesadas. Recebe um objeto no formato { "Instagram": 10, "WhatsApp": 5 }, calcula o maior 
// valor (Math.max) e ajusta proporcionalmente a largura das barras via estilo inline: width: ${(v / max) * 100}%.
export default function Chart({ title, data = {} }) {
    const entries = Object.entries(data);
    const max = Math.max(...entries.map(x => x[1]), 1);

    return (
        <article className="chart">
            <h2>{title}</h2>

            {entries.length ? (
                entries.map(([k, v]) => (
                    <div
                        className="bar"
                        key={k}
                        style={{ gridTemplateColumns: '110px 1fr 28px' }}
                    >
                        <span
                            title={label(k)}
                            style={{
                                minWidth: 0,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}
                        >
                            {label(k)}
                        </span>
                            
                        <i>
                            <b style={{ width: `${(v / max) * 100}%` }} /> 
                        </i>
                        
                        <strong>{v}</strong>
                    </div>
                ))
            ) : (
                <p>Sem dados ainda.</p>
            )}
        </article>
    );
}
// calcula o maior 
// valor (Math.max) e ajusta proporcionalmente a largura das barras via estilo inline