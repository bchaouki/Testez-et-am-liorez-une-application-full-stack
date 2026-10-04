package com.openclassrooms.starterjwt.integration;

import com.openclassrooms.starterjwt.models.User;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class UserControllerIntegrationTest extends AbstractIntegrationTest {

    @Test
    @DisplayName("GET /api/user/{id} renvoie les informations de l'utilisateur (sans mot de passe)")
    void findById_returnsUser() throws Exception {
        User user = createUser("john@test.com", false);

        mockMvc.perform(get("/api/user/{id}", user.getId()).header("Authorization", bearer(user)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(user.getId()))
                .andExpect(jsonPath("$.email").value("john@test.com"))
                .andExpect(jsonPath("$.firstName").value("John"))
                .andExpect(jsonPath("$.lastName").value("Doe"))
                .andExpect(jsonPath("$.admin").value(false))
                .andExpect(jsonPath("$.password").doesNotExist());
    }

    @Test
    @DisplayName("GET /api/user/{id} renvoie 404 si l'utilisateur n'existe pas")
    void findById_unknownId_returnsNotFound() throws Exception {
        User user = createUser("john@test.com", false);

        mockMvc.perform(get("/api/user/{id}", 999999).header("Authorization", bearer(user)))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("GET /api/user/{id} renvoie 400 si l'identifiant n'est pas numérique")
    void findById_invalidId_returnsBadRequest() throws Exception {
        User user = createUser("john@test.com", false);

        mockMvc.perform(get("/api/user/abc").header("Authorization", bearer(user)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("DELETE /api/user/{id} supprime son propre compte")
    void delete_ownAccount_deletesUser() throws Exception {
        User user = createUser("john@test.com", false);

        mockMvc.perform(delete("/api/user/{id}", user.getId()).header("Authorization", bearer(user)))
                .andExpect(status().isOk());

        assertThat(userRepository.findById(user.getId())).isEmpty();
    }

    @Test
    @DisplayName("DELETE /api/user/{id} renvoie 401 si on tente de supprimer le compte d'un autre")
    void delete_otherAccount_returnsUnauthorized() throws Exception {
        User user = createUser("john@test.com", false);
        User other = createUser("other@test.com", false);

        mockMvc.perform(delete("/api/user/{id}", other.getId()).header("Authorization", bearer(user)))
                .andExpect(status().isUnauthorized());

        assertThat(userRepository.findById(other.getId())).isPresent();
    }

    @Test
    @DisplayName("DELETE /api/user/{id} renvoie 404 si l'utilisateur n'existe pas")
    void delete_unknownId_returnsNotFound() throws Exception {
        User user = createUser("john@test.com", false);

        mockMvc.perform(delete("/api/user/{id}", 999999).header("Authorization", bearer(user)))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("DELETE /api/user/{id} renvoie 400 si l'identifiant n'est pas numérique")
    void delete_invalidId_returnsBadRequest() throws Exception {
        User user = createUser("john@test.com", false);

        mockMvc.perform(delete("/api/user/abc").header("Authorization", bearer(user)))
                .andExpect(status().isBadRequest());
    }
}
