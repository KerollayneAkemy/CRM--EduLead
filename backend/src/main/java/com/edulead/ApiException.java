package com.edulead;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

final class ApiException {

    private ApiException() {
    }

    static ResponseStatusException badRequest(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }

    static ResponseStatusException notFound(String resource) {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, resource + " não encontrado");
    }
}
