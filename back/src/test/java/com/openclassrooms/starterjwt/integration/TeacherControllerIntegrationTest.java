package com.openclassrooms.starterjwt.integration;

import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.models.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class TeacherControllerIntegrationTest extends AbstractIntegrationTest {

    private String token;

    @BeforeEach
    void setUp() {
        User user = createUser("user@test.com", false);
        token = bearer(user);
    }

    @Test
    @DisplayName("GET /api/teacher renvoie la liste des professeurs")
    void findAll_returnsTeachers() throws Exception {
        createTeacher();
        createTeacher();

        mockMvc.perform(get("/api/teacher").header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)));
    }

    @Test
    @DisplayName("GET /api/teacher/{id} renvoie le professeur demandé")
    void findById_returnsTeacher() throws Exception {
        Teacher teacher = createTeacher();

        mockMvc.perform(get("/api/teacher/{id}", teacher.getId()).header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(teacher.getId()))
                .andExpect(jsonPath("$.firstName").value("Margot"))
                .andExpect(jsonPath("$.lastName").value("Delahaye"));
    }

    @Test
    @DisplayName("GET /api/teacher/{id} renvoie 404 si le professeur n'existe pas")
    void findById_unknownId_returnsNotFound() throws Exception {
        mockMvc.perform(get("/api/teacher/{id}", 999999).header("Authorization", token))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Error: Teacher not found"));
    }

    @Test
    @DisplayName("GET /api/teacher/{id} renvoie 400 si l'identifiant n'est pas numérique")
    void findById_invalidId_returnsBadRequest() throws Exception {
        mockMvc.perform(get("/api/teacher/abc").header("Authorization", token))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("GET /api/teacher renvoie 401 sans jeton")
    void findAll_withoutToken_returnsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/teacher"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /api/teacher renvoie 401 avec un jeton invalide")
    void findAll_withInvalidToken_returnsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/teacher").header("Authorization", "Bearer invalid.token.value"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /api/teacher renvoie 401 avec le jeton d'un utilisateur supprimé")
    void findAll_withTokenOfDeletedUser_returnsUnauthorized() throws Exception {
        userRepository.deleteAll();

        mockMvc.perform(get("/api/teacher").header("Authorization", token))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /api/teacher renvoie 401 si l'en-tête n'est pas de type Bearer")
    void findAll_withNonBearerHeader_returnsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/teacher").header("Authorization", "Basic abc"))
                .andExpect(status().isUnauthorized());
    }
}
