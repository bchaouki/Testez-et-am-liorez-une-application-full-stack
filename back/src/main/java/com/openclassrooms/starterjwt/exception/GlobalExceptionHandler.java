package com.openclassrooms.starterjwt.exception;

import com.openclassrooms.starterjwt.payload.response.MessageResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

/**
 * Centralise la gestion des exceptions levées par les controllers.
 * Remplace les blocs try/catch dupliqués dans chaque endpoint.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler({NumberFormatException.class, MethodArgumentTypeMismatchException.class})
    public ResponseEntity<MessageResponse> handleInvalidIdentifier(Exception ex) {
        return build(HttpStatus.BAD_REQUEST, "Error: Invalid identifier");
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<MessageResponse> handleBadRequest(BadRequestException ex) {
        return build(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<MessageResponse> handleNotFound(NotFoundException ex) {
        return build(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<MessageResponse> handleUnauthorized(UnauthorizedException ex) {
        return build(HttpStatus.UNAUTHORIZED, ex.getMessage());
    }

    private ResponseEntity<MessageResponse> build(HttpStatus status, String message) {
        String body = message != null ? message : status.getReasonPhrase();
        return ResponseEntity.status(status).body(new MessageResponse(body));
    }
}
