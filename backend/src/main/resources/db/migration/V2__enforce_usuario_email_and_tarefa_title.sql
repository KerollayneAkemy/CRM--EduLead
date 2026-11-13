-- Execute somente após: backup, cópia isolada, pré-validação sem resultados e baseline 1.
-- Schema confirmado antes da preparação: VARCHAR(255), utf8mb4, utf8mb4_0900_ai_ci.
-- Esta migration não corrige dados. Valores nulos, vazios ou e-mails duplicados bloqueiam a execução.

ALTER TABLE `tarefa`
    MODIFY COLUMN `titulo` VARCHAR(255)
        CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL;

ALTER TABLE `usuario`
    MODIFY COLUMN `email` VARCHAR(255)
        CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
    ADD CONSTRAINT `uk_usuario_email` UNIQUE (`email`);
