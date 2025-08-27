package com.workly.exception;

import com.workly.dto.ErrorResponseDTO;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.nio.file.AccessDeniedException;
import java.time.LocalDateTime;

@RestControllerAdvice
public class GlobalExceptionHandler {
    private ResponseEntity<ErrorResponseDTO> buildErrorResponse(HttpStatus status, String message,
                                                                HttpServletRequest request) {
        ErrorResponseDTO errorResponse = new ErrorResponseDTO(
                status.value(),
                status.getReasonPhrase(),
                message,
                request.getRequestURI(),
                LocalDateTime.now()
        );

        return ResponseEntity.status(status).body(errorResponse);
    }

    //401 - Credenciais Inválidas
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponseDTO> handleBadCredentials(BadCredentialsException ex, HttpServletRequest request ) {
        return buildErrorResponse(HttpStatus.UNAUTHORIZED, "Credenciais inválidas", request);
    }

    //403 - Acesso Negado
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponseDTO> handleBadCredentials(AccessDeniedException ex, HttpServletRequest request ) {
        return buildErrorResponse(HttpStatus.UNAUTHORIZED, "Acesso Negado", request);
    }

    //400 - Erros de Validação
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponseDTO> handleBadCredentials(MethodArgumentNotValidException ex, HttpServletRequest request ) {
        String firstErrorMessage = ex.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(error -> error.getField() + " " + error.getDefaultMessage())
                .orElse("Requisição inválida");

        return buildErrorResponse(HttpStatus.UNAUTHORIZED, firstErrorMessage, request);
    }

    //500 - Erro interno
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponseDTO> handleBadCredentials(RuntimeException ex, HttpServletRequest request ) {
        return buildErrorResponse(HttpStatus.UNAUTHORIZED, ex.getMessage(), request);
    }
}
