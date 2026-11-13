package com.edulead.controller;

import com.edulead.model.Anexo;
import com.edulead.service.AnexoService;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api")
public class AnexoController {
    private final AnexoService anexos;

    public AnexoController(AnexoService anexos) {
        this.anexos = anexos;
    }

    @GetMapping("/interessados/{interessadoId}/anexos")
    public List<Anexo> all(@PathVariable Long interessadoId) {
        return anexos.allForInteressado(interessadoId);
    }

    @PostMapping("/interessados/{interessadoId}/anexos")
    public Anexo upload(@PathVariable Long interessadoId, @RequestParam("arquivo") MultipartFile arquivo) {
        return anexos.upload(interessadoId, arquivo);
    }

    @GetMapping("/anexos/{id}/download")
    public Map<String, String> downloadUrl(@PathVariable Long id) {
        return Map.of("url", anexos.downloadUrl(id));
    }

    @DeleteMapping("/anexos/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        anexos.delete(id);
    }
}
