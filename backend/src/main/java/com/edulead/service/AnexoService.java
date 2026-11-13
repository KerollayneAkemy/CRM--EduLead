package com.edulead.service;

import com.edulead.config.R2Properties;
import com.edulead.exception.ApiException;
import com.edulead.model.Anexo;
import com.edulead.model.Interessado;
import com.edulead.model.Usuario;
import com.edulead.repository.AnexoRepository;
import com.edulead.security.AuthenticatedUser;
import com.edulead.security.CurrentUser;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class AnexoService {
    private static final Map<String, String> MIME_POR_EXTENSAO = Map.of(
            "pdf", "application/pdf", "png", "image/png", "jpg", "image/jpeg", "jpeg", "image/jpeg",
            "doc", "application/msword", "docx",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document");

    private final AnexoRepository anexos;
    private final InteressadoService interessados;
    private final UsuarioService usuarios;
    private final R2StorageService storage;
    private final R2Properties properties;

    public AnexoService(AnexoRepository anexos, InteressadoService interessados, UsuarioService usuarios,
            R2StorageService storage, R2Properties properties) {
        this.anexos = anexos;
        this.interessados = interessados;
        this.usuarios = usuarios;
        this.storage = storage;
        this.properties = properties;
    }

    public List<Anexo> allForInteressado(Long interessadoId) {
        interessados.find(interessadoId);
        if (!properties.isEnabled()) {
            return List.of();
        }
        return anexos.findByInteressadoIdOrderByCriadoEmDesc(interessadoId);
    }

    public Anexo upload(Long interessadoId, MultipartFile file) {
        Interessado interessado = interessados.find(interessadoId);
        validate(file);
        String originalName = file.getOriginalFilename().trim();
        String key = "interessados/" + interessadoId + "/" + UUID.randomUUID() + "." + extension(originalName);
        try {
            storage.upload(key, file.getContentType(), file.getBytes());
        } catch (IOException exception) {
            throw ApiException.badRequest("Não foi possível ler o arquivo enviado");
        }

        AuthenticatedUser current = CurrentUser.get();
        Anexo anexo = new Anexo();
        anexo.nomeOriginal = originalName;
        anexo.tipoMime = file.getContentType();
        anexo.tamanho = file.getSize();
        anexo.objectKey = key;
        anexo.interessado = interessado;
        anexo.enviadoPor = usuarios.find(current.id());
        try {
            return anexos.save(anexo);
        } catch (RuntimeException exception) {
            // Evita arquivo órfão quando o banco recusa os metadados após o upload.
            try {
                storage.delete(key);
            } catch (RuntimeException ignored) {
                // O erro original do banco é mais útil para o cliente; o objeto fica rastreável pela chave nos logs do R2.
            }
            throw exception;
        }
    }

    public String downloadUrl(Long id) {
        Anexo anexo = findAndAuthorize(id);
        return storage.signedDownloadUrl(anexo.objectKey);
    }

    @Transactional
    public void delete(Long id) {
        Anexo anexo = findAndAuthorize(id);
        AuthenticatedUser current = CurrentUser.get();
        if (!current.isGestor() && !current.id().equals(anexo.enviadoPor.id)) {
            throw ApiException.forbidden("Você só pode excluir arquivos enviados por você");
        }
        anexos.delete(anexo);
        // Se a exclusão no R2 falhar, a exceção reverte a remoção dos metadados.
        storage.delete(anexo.objectKey);
    }

    private Anexo findAndAuthorize(Long id) {
        Anexo anexo = anexos.findById(id).orElseThrow(() -> ApiException.notFound("Anexo"));
        interessados.find(anexo.interessado.id);
        return anexo;
    }

    private void validate(MultipartFile file) {
        if (file == null || file.isEmpty() || file.getOriginalFilename() == null) {
            throw ApiException.badRequest("Selecione um arquivo");
        }
        if (file.getSize() > properties.getMaxFileSizeBytes()) {
            throw ApiException.badRequest("O arquivo excede o tamanho permitido");
        }
        String extension = extension(file.getOriginalFilename());
        if (!MIME_POR_EXTENSAO.containsKey(extension)
                || !MIME_POR_EXTENSAO.get(extension).equalsIgnoreCase(file.getContentType())) {
            throw ApiException.badRequest("Tipo de arquivo não permitido");
        }
        try {
            if (!hasExpectedSignature(extension, file.getBytes())) {
                throw ApiException.badRequest("O conteúdo do arquivo não corresponde ao tipo informado");
            }
        } catch (IOException exception) {
            throw ApiException.badRequest("Não foi possível ler o arquivo enviado");
        }
    }

    private String extension(String name) {
        int dot = name.lastIndexOf('.');
        if (dot < 1 || dot == name.length() - 1) {
            throw ApiException.badRequest("Arquivo sem extensão válida");
        }
        return name.substring(dot + 1).toLowerCase(Locale.ROOT);
    }

    /**
     * Confere assinaturas simples dos formatos aceitos para não confiar somente
     * no nome e no Content-Type enviados pelo navegador. Não substitui antivírus.
     */
    private boolean hasExpectedSignature(String extension, byte[] content) {
        if (content == null) {
            return false;
        }
        return switch (extension) {
            case "pdf" -> beginsWith(content, "%PDF-".getBytes());
            case "png" -> beginsWith(content, new byte[] {(byte) 0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a});
            case "jpg", "jpeg" -> beginsWith(content, new byte[] {(byte) 0xff, (byte) 0xd8, (byte) 0xff});
            case "doc" -> beginsWith(content, new byte[] {(byte) 0xd0, (byte) 0xcf, 0x11, (byte) 0xe0,
                    (byte) 0xa1, (byte) 0xb1, 0x1a, (byte) 0xe1});
            case "docx" -> beginsWith(content, new byte[] {0x50, 0x4b, 0x03, 0x04});
            default -> false;
        };
    }

    private boolean beginsWith(byte[] content, byte[] signature) {
        return content.length >= signature.length
                && Arrays.equals(Arrays.copyOf(content, signature.length), signature);
    }
}
