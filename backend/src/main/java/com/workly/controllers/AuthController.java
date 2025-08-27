package com.workly.controllers;

import com.workly.domain.token.RefreshToken;
import com.workly.domain.token.RequestRefreshTokenDTO;
import com.workly.domain.user.AuthenticationDTO;
import com.workly.domain.user.RegisterDTO;
import com.workly.domain.user.ResponseDTO;
import com.workly.domain.user.User;
import com.workly.infra.security.TokenService;
import com.workly.repositories.RefreshTokenRepository;
import com.workly.repositories.UserRepository;
import com.workly.services.RefreshTokenService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/Auth")
@AllArgsConstructor
public class AuthController {
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final TokenService tokenService;
    private final RefreshTokenService refreshTokenService;
    private final RefreshTokenRepository refreshTokenRepository;



    @PostMapping("/login")
    public ResponseEntity<ResponseDTO> login (@RequestBody @Valid AuthenticationDTO body){
        var usernamePassword = new UsernamePasswordAuthenticationToken(body.email(), body.password());
        var auth = this.authenticationManager.authenticate(usernamePassword);

        User user = (User) auth.getPrincipal();
        var token = tokenService.generatedToken(user);
        var refreshtoken = refreshTokenService.creationRefreshToken(user.getId());
        return ResponseEntity.ok(new ResponseDTO(token, refreshtoken.getToken()));
    }

    @PostMapping("/register")
    public ResponseEntity register(@RequestBody @Valid RegisterDTO body) {
        if (this.userRepository.findByEmail(body.email()) != null) {
            return ResponseEntity.badRequest().build();
        }

        String encryptedPassword  = new BCryptPasswordEncoder().encode(body.password());
        User user = new User(body.name(), body.email(), encryptedPassword, body.role());

        this.userRepository.save(user);

        return ResponseEntity.ok().build();
    }

    @PostMapping("/refresh")
    public ResponseEntity<ResponseDTO> refreshToken(@RequestBody @Valid RequestRefreshTokenDTO req) {
        String refreshToken = req.refreshToken();

        return refreshTokenRepository.findByToken(refreshToken)
                .map(token -> refreshTokenService.verifyExpiration(token))
                .map(RefreshToken::getUser)
                .map(user -> {
                    String newAccessToken = tokenService.generatedToken(user);
                    return  ResponseEntity.ok(new ResponseDTO(newAccessToken, refreshToken));
                })
                .orElseThrow(() -> new RuntimeException("Refresh Token Inválido"));
    }
}
