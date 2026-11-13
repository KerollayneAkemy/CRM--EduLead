package com.edulead.service;

import com.edulead.config.R2Properties;
import com.edulead.repository.AnexoRepository;
import org.junit.jupiter.api.Test;
import org.springframework.web.multipart.MultipartFile;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class AnexoServiceTest {
    @Test
    void disabledStorageDoesNotQueryAttachmentTable() {
        R2Properties properties = new R2Properties();
        InteressadoService interessados = mock(InteressadoService.class);
        AnexoService service = new AnexoService(mock(AnexoRepository.class), interessados, mock(UsuarioService.class),
                mock(R2StorageService.class), properties);

        assertEquals(java.util.List.of(), service.allForInteressado(1L));
    }

    @Test
    void rejectsUnsupportedFileBeforeTryingStorage() {
        R2Properties properties = new R2Properties();
        MultipartFile file = mock(MultipartFile.class);
        when(file.isEmpty()).thenReturn(false);
        when(file.getOriginalFilename()).thenReturn("arquivo.exe");
        when(file.getSize()).thenReturn(100L);
        when(file.getContentType()).thenReturn("application/octet-stream");
        AnexoService service = new AnexoService(mock(AnexoRepository.class), mock(InteressadoService.class),
                mock(UsuarioService.class), mock(R2StorageService.class), properties);

        assertThrows(org.springframework.web.server.ResponseStatusException.class, () -> service.upload(1L, file));
    }

    @Test
    void rejectsExtensionAndMimeTypeThatDoNotMatch() {
        R2Properties properties = new R2Properties();
        MultipartFile file = mock(MultipartFile.class);
        when(file.isEmpty()).thenReturn(false);
        when(file.getOriginalFilename()).thenReturn("documento.pdf");
        when(file.getSize()).thenReturn(100L);
        when(file.getContentType()).thenReturn("image/jpeg");
        AnexoService service = new AnexoService(mock(AnexoRepository.class), mock(InteressadoService.class),
                mock(UsuarioService.class), mock(R2StorageService.class), properties);

        assertThrows(org.springframework.web.server.ResponseStatusException.class, () -> service.upload(1L, file));
    }

    @Test
    void rejectsFileWhoseContentDoesNotMatchItsDeclaredType() throws Exception {
        R2Properties properties = new R2Properties();
        MultipartFile file = mock(MultipartFile.class);
        when(file.isEmpty()).thenReturn(false);
        when(file.getOriginalFilename()).thenReturn("documento.pdf");
        when(file.getSize()).thenReturn(100L);
        when(file.getContentType()).thenReturn("application/pdf");
        when(file.getBytes()).thenReturn("conteudo sem assinatura de PDF".getBytes());
        AnexoService service = new AnexoService(mock(AnexoRepository.class), mock(InteressadoService.class),
                mock(UsuarioService.class), mock(R2StorageService.class), properties);

        assertThrows(org.springframework.web.server.ResponseStatusException.class, () -> service.upload(1L, file));
    }
}
