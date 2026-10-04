package com.openclassrooms.starterjwt.exception;

import com.openclassrooms.starterjwt.payload.response.MessageResponse;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.assertj.core.api.Assertions.assertThat;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    @DisplayName("NumberFormatException donne 400")
    void invalidIdentifier_returnsBadRequest() {
        ResponseEntity<MessageResponse> response = handler.handleInvalidIdentifier(new NumberFormatException());

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody().getMessage()).isEqualTo("Error: Invalid identifier");
    }

    @Test
    @DisplayName("BadRequestException donne 400 avec son message")
    void badRequest_returnsBadRequestWithMessage() {
        ResponseEntity<MessageResponse> response = handler.handleBadRequest(new BadRequestException("Oops"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody().getMessage()).isEqualTo("Oops");
    }

    @Test
    @DisplayName("sans message, la raison HTTP est utilisée")
    void exceptionWithoutMessage_usesReasonPhrase() {
        assertThat(handler.handleBadRequest(new BadRequestException()).getBody().getMessage())
                .isEqualTo("Bad Request");
        assertThat(handler.handleNotFound(new NotFoundException()).getBody().getMessage())
                .isEqualTo("Not Found");
        assertThat(handler.handleUnauthorized(new UnauthorizedException()).getBody().getMessage())
                .isEqualTo("Unauthorized");
    }

    @Test
    @DisplayName("NotFoundException donne 404 et UnauthorizedException donne 401")
    void notFoundAndUnauthorized_returnExpectedStatus() {
        assertThat(handler.handleNotFound(new NotFoundException("x")).getStatusCode())
                .isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(handler.handleUnauthorized(new UnauthorizedException("x")).getStatusCode())
                .isEqualTo(HttpStatus.UNAUTHORIZED);
    }
}
