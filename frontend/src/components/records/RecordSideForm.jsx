import React from 'react';
import { label } from '../../constants';

export default function RecordSideForm({ singular, fields, f, setF, add }) {
    return (
        <form className="side-form" onSubmit={add}>
            <h2>Novo {singular}</h2>
            <p>
                Preencha os dados para disponibilizá-lo no
                sistema.
            </p>

            {fields.map(k => (
                <label key={k}>
                    {label(k)}
                    <input
                        type={
                            k === 'senha'
                                ? 'password'
                                : k === 'email'
                                    ? 'email'
                                    : 'text'
                        }
                        value={f[k] || ''}
                        onChange={e =>
                            setF({
                                ...f,
                                [k]: e.target.value
                            })
                        }
                    />
                </label>
            ))}

            <button>Salvar {singular}</button>
        </form>
    );
}
