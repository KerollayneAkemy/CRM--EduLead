import React from 'react';
import { label } from '../constants';

export default function Chart({ title, data = {} }) {
    const entries = Object.entries(data);
    const max = Math.max(...entries.map(x => x[1]), 1);

    return (
        <article className="chart">
            <h2>{title}</h2>

            {entries.length ? (
                entries.map(([k, v]) => (
                    <div className="bar" key={k}>
                        <span>{label(k)}</span>

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
