package com.edulead.service;

import com.edulead.config.AiProperties;
import com.edulead.exception.ApiException;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class GeminiAssistantProvider implements AssistantProvider {
    private final AiProperties properties;
    private final RestClient client;

    public GeminiAssistantProvider(AiProperties properties) {
        this.properties = properties;
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(Duration.ofSeconds(5));
        requestFactory.setReadTimeout(Duration.ofSeconds(15));
        client = RestClient.builder().baseUrl("https://generativelanguage.googleapis.com")
                .requestFactory(requestFactory).build();
    }

    @Override
    public boolean isAvailable() {
        return properties.isEnabled() && "gemini".equalsIgnoreCase(properties.getProvider())
                && properties.getApiKey() != null && !properties.getApiKey().isBlank();
    }

    @Override
    @SuppressWarnings("unchecked")
    public String answer(String systemInstruction, String question) {
        if (!isAvailable()) {
            throw ApiException.serviceUnavailable("Assistente de IA ainda não está configurado");
        }
        try {
            Map<String, Object> body = Map.of(
                    "system_instruction", Map.of("parts", List.of(Map.of("text", systemInstruction))),
                    "contents", List.of(Map.of("parts", List.of(Map.of("text", question)))),
                    "generationConfig", Map.of("maxOutputTokens", 300));
            Map<String, Object> response = client.post()
                    .uri("/v1beta/models/{model}:generateContent?key={key}", properties.getModel(), properties.getApiKey())
                    .contentType(MediaType.APPLICATION_JSON).body(body).retrieve().body(Map.class);
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
            Map<String, Object> content = (Map<String, Object>) candidates.getFirst().get("content");
            List<Map<String, String>> parts = (List<Map<String, String>>) content.get("parts");
            return parts.getFirst().get("text");
        } catch (Exception exception) {
            throw ApiException.serviceUnavailable("Não foi possível consultar o assistente agora");
        }
    }
}
