package com.openclassrooms.starterjwt.integration;

import com.openclassrooms.starterjwt.payload.request.LoginRequest;
import com.openclassrooms.starterjwt.payload.request.SignupRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AuthControllerIntegrationTest extends AbstractIntegrationTest {

    private LoginRequest login(String email, String password) {
        LoginRequest request = new LoginRequest();
        request.setEmail(email);
        request.setPassword(password);
        return request;
    }

    private SignupRequest signup(String email) {
        SignupRequest request = new SignupRequest();
        request.setEmail(email);
        request.setFirstName("Jane");
        request.setLastName("Smith");
        request.setPassword("password123");
        return request;
    }

    @Test
    @DisplayName("POST /api/auth/login connecte un administrateur et renvoie un jeton")
    void login_admin_returnsJwt() throws Exception {
        createUser("yoga@studio.com", true);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login("yoga@studio.com", PASSWORD))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", notNullValue()))
                .andExpect(jsonPath("$.type").value("Bearer"))
                .andExpect(jsonPath("$.username").value("yoga@studio.com"))
                .andExpect(jsonPath("$.admin").value(true));
    }

    @Test
    @DisplayName("POST /api/auth/login connecte un utilisateur non administrateur")
    void login_user_returnsJwtWithAdminFalse() throws Exception {
        createUser("user@test.com", false);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login("user@test.com", PASSWORD))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.admin").value(false));
    }

    @Test
    @DisplayName("POST /api/auth/login renvoie 401 avec un mauvais mot de passe")
    void login_wrongPassword_returnsUnauthorized() throws Exception {
        createUser("user@test.com", false);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login("user@test.com", "wrong"))))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("POST /api/auth/login renvoie 401 avec un email inconnu")
    void login_unknownEmail_returnsUnauthorized() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login("nobody@test.com", PASSWORD))))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("POST /api/auth/login renvoie 400 si un champ obligatoire est absent")
    void login_missingField_returnsBadRequest() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login("user@test.com", ""))))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/auth/register crée un compte")
    void register_createsAccount() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signup("jane@test.com"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("User registered successfully!"));

        assertThat(userRepository.findByEmail("jane@test.com"))
                .hasValueSatisfying(user -> {
                    assertThat(user.isAdmin()).isFalse();
                    assertThat(passwordEncoder.matches("password123", user.getPassword())).isTrue();
                });
    }

    @Test
    @DisplayName("POST /api/auth/register renvoie 400 si l'email est déjà utilisé")
    void register_existingEmail_returnsBadRequest() throws Exception {
        createUser("jane@test.com", false);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signup("jane@test.com"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Error: Email is already taken!"));
    }

    @Test
    @DisplayName("POST /api/auth/register renvoie 400 si un champ obligatoire est absent")
    void register_missingField_returnsBadRequest() throws Exception {
        SignupRequest request = signup("jane@test.com");
        request.setFirstName(null);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());

        assertThat(userRepository.existsByEmail("jane@test.com")).isFalse();
    }
}
