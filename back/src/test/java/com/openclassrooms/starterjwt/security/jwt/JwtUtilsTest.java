package com.openclassrooms.starterjwt.security.jwt;

import com.openclassrooms.starterjwt.security.services.UserDetailsImpl;
import io.jsonwebtoken.Jwts;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;

class JwtUtilsTest {

    private static final String SECRET = "cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e";
    private static final String OTHER_SECRET = "0123456789abcdef".repeat(8);

    private JwtUtils jwtUtils;

    @BeforeEach
    void setUp() {
        jwtUtils = newJwtUtils(SECRET, 60_000);
    }

    private JwtUtils newJwtUtils(String secret, int expirationMs) {
        JwtUtils utils = new JwtUtils();
        ReflectionTestUtils.setField(utils, "jwtSecret", secret);
        ReflectionTestUtils.setField(utils, "jwtExpirationMs", expirationMs);
        return utils;
    }

    private Authentication authentication() {
        UserDetailsImpl principal = UserDetailsImpl.builder().id(1L).username("yoga@studio.com").build();
        return new UsernamePasswordAuthenticationToken(principal, null);
    }

    @Test
    @DisplayName("un jeton généré est valide et contient l'email de l'utilisateur")
    void generatedToken_isValid_andContainsUsername() {
        String token = jwtUtils.generateJwtToken(authentication());

        assertThat(jwtUtils.validateJwtToken(token)).isTrue();
        assertThat(jwtUtils.getUserNameFromJwtToken(token)).isEqualTo("yoga@studio.com");
    }

    @Test
    @DisplayName("un jeton signé avec une autre clé est refusé")
    void tokenWithOtherSignature_isInvalid() {
        String token = newJwtUtils(OTHER_SECRET, 60_000).generateJwtToken(authentication());

        assertThat(jwtUtils.validateJwtToken(token)).isFalse();
    }

    @Test
    @DisplayName("un jeton mal formé est refusé")
    void malformedToken_isInvalid() {
        assertThat(jwtUtils.validateJwtToken("not.a.jwt")).isFalse();
    }

    @Test
    @DisplayName("un jeton expiré est refusé")
    void expiredToken_isInvalid() {
        String token = newJwtUtils(SECRET, -1_000).generateJwtToken(authentication());

        assertThat(jwtUtils.validateJwtToken(token)).isFalse();
    }

    @Test
    @DisplayName("un jeton non signé est refusé")
    void unsignedToken_isInvalid() {
        String token = Jwts.builder().subject("yoga@studio.com").compact();

        assertThat(jwtUtils.validateJwtToken(token)).isFalse();
    }

    @Test
    @DisplayName("un jeton vide est refusé")
    void emptyToken_isInvalid() {
        assertThat(jwtUtils.validateJwtToken("")).isFalse();
    }
}
