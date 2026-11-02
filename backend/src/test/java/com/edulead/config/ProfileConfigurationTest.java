package com.edulead.config;

import java.util.Properties;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.support.PropertiesLoaderUtils;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ProfileConfigurationTest {
    @Test
    void developmentProfileKeepsLocalSchemaUpdateAndOptionalSeed() throws Exception {
        Properties properties = load("application-dev.properties");

        assertEquals("update", properties.getProperty("spring.jpa.hibernate.ddl-auto"));
        assertEquals("${SEED_ENABLED:true}", properties.getProperty("edulead.seed.enabled"));
    }

    @Test
    void productionProfileRequiresExternalJwtAndDoesNotSeed() throws Exception {
        Properties properties = load("application-prod.properties");
        String secret = properties.getProperty("edulead.jwt.secret");

        assertEquals("validate", properties.getProperty("spring.jpa.hibernate.ddl-auto"));
        assertEquals("false", properties.getProperty("edulead.seed.enabled"));
        assertEquals("${JWT_SECRET}", secret);
        assertFalse(secret.contains(":"));
        assertTrue(properties.getProperty("spring.datasource.password").contains("DB_PASSWORD"));
    }

    private Properties load(String file) throws Exception {
        return PropertiesLoaderUtils.loadProperties(new ClassPathResource(file));
    }
}
