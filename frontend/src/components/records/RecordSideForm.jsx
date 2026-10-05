import React from 'react';
import { label } from '../../constants';
 // formulário reutilizável para cadastrar um novo registro.
export default function RecordSideForm({ singular, fields, f, setF, add }) {
    return (
        <form className="side-form" onSubmit={add}>
            <h2>Novo {singular}</h2>
            <p>
                Preencha os dados para disponibilizá-lo no
                sistema.
            </p>

            {fields.map(k => ( // percorre a lista dos campos, k= key para identificar cada item criado pelo .map
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
                        value={f[k] || ''} //f[k] guarda os dados que o usuário está digitando
                        onChange={e => // formulário reutilizável para cadastrar um novo registro.
                            setF({
                                ...f,
                                [k]: e.target.value // é o que foi digitado.
                            })
                        }
                    />
                </label>
            ))}

            <button>Salvar {singular}</button>
        </form>
    );
}
// é um componente genérico de formulário. Ele não é responsável diretamente por cadastrar no banco. 
// Ele apenas monta os campos, captura o que o usuário digitou e chama a função add para realizar o cadastro