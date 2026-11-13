CREATE TABLE `anexo` (
    `id` bigint NOT NULL AUTO_INCREMENT,
    `nome_original` varchar(255) NOT NULL,
    `tipo_mime` varchar(120) NOT NULL,
    `tamanho` bigint NOT NULL,
    `object_key` varchar(512) NOT NULL,
    `criado_em` datetime(6) NOT NULL,
    `interessado_id` bigint NOT NULL,
    `enviado_por_id` bigint NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_anexo_object_key` (`object_key`),
    KEY `idx_anexo_interessado` (`interessado_id`),
    KEY `idx_anexo_enviado_por` (`enviado_por_id`),
    CONSTRAINT `fk_anexo_interessado` FOREIGN KEY (`interessado_id`) REFERENCES `interessado` (`id`),
    CONSTRAINT `fk_anexo_enviado_por` FOREIGN KEY (`enviado_por_id`) REFERENCES `usuario` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
