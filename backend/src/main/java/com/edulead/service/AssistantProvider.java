package com.edulead.service;

/** Contrato para permitir trocar o provedor de IA sem alterar endpoints ou frontend. */
public interface AssistantProvider {
    String answer(String systemInstruction, String question);
    boolean isAvailable();
}
