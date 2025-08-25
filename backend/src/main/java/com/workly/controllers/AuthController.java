package com.workly.controllers;

import com.workly.domain.user.AuthenticationDTO;
import com.workly.domain.user.RegisterDTO;
import com.workly.domain.user.ResponseDTO;
import com.workly.domain.user.User;
import com.workly.infra.security.TokenService;
import com.workly.repositories.UserRepository;
import jakarta.validation.Valid;
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
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private TokenService tokenService;


    @PostMapping("/login")
    public ResponseEntity login (@RequestBody @Valid AuthenticationDTO body){
        var usernamePassword = new UsernamePasswordAuthenticationToken(body.email(), body.password());
        var auth = this.authenticationManager.authenticate(usernamePassword);

        var token = tokenService.generatedToken((User) auth.getPrincipal());
        return ResponseEntity.ok(new ResponseDTO(token));
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
}
