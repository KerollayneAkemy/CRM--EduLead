CREATE TABLE `historico_etapa` (
    `id` bigint NOT NULL AUTO_INCREMENT,
    `etapa_anterior` varchar(255) NOT NULL,
    `etapa_nova` varchar(255) NOT NULL,
    `criado_em` datetime(6) NOT NULL,
    `interessado_id` bigint NOT NULL,
    PRIMARY KEY (`id`),
    KEY `idx_historico_etapa_interessado` (`interessado_id`),
    CONSTRAINT `fk_historico_etapa_interessado`
        FOREIGN KEY (`interessado_id`) REFERENCES `interessado` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
