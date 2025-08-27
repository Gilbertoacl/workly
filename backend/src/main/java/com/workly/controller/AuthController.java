package com.workly.controller;

import com.workly.entity.RefreshToken;
import com.workly.dto.token.RequestRefreshTokenDTO;
import com.workly.dto.user.AuthenticationDTO;
import com.workly.dto.user.RegisterDTO;
import com.workly.dto.user.ResponseDTO;
import com.workly.entity.User;
import com.workly.service.TokenService;
import com.workly.repository.RefreshTokenRepository;
import com.workly.repository.UserRepository;
import com.workly.service.RefreshTokenService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
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
