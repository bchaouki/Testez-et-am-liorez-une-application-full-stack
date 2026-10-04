package com.openclassrooms.starterjwt.integration;

import com.openclassrooms.starterjwt.dto.SessionDto;
import com.openclassrooms.starterjwt.models.Session;
import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.models.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import java.util.Date;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class SessionControllerIntegrationTest extends AbstractIntegrationTest {

    private User user;
    private String token;
    private Teacher teacher;

    @BeforeEach
    void setUp() {
        user = createUser("user@test.com", false);
        token = bearer(user);
        teacher = createTeacher();
    }

    private SessionDto sessionDto(String name) {
        SessionDto dto = new SessionDto();
        dto.setName(name);
        dto.setDate(new Date());
        dto.setDescription("Une description");
        dto.setTeacher_id(teacher.getId());
        dto.setUsers(List.of());
        return dto;
    }

    // --- Lecture -------------------------------------------------------------

    @Test
    @DisplayName("GET /api/session renvoie la liste des sessions")
    void findAll_returnsSessions() throws Exception {
        createSession(teacher);
        createSession(teacher);

        mockMvc.perform(get("/api/session").header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)));
    }

    @Test
    @DisplayName("GET /api/session/{id} renvoie les informations de la session")
    void findById_returnsSession() throws Exception {
        Session session = createSession(teacher);

        mockMvc.perform(get("/api/session/{id}", session.getId()).header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(session.getId()))
                .andExpect(jsonPath("$.name").value("Yoga matinal"))
                .andExpect(jsonPath("$.description").value("Séance de yoga du matin"))
                .andExpect(jsonPath("$.teacher_id").value(teacher.getId()))
                .andExpect(jsonPath("$.users", hasSize(0)));
    }

    @Test
    @DisplayName("GET /api/session/{id} renvoie 404 si la session n'existe pas")
    void findById_unknownId_returnsNotFound() throws Exception {
        mockMvc.perform(get("/api/session/{id}", 999999).header("Authorization", token))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("GET /api/session/{id} renvoie 400 si l'identifiant n'est pas numérique")
    void findById_invalidId_returnsBadRequest() throws Exception {
        mockMvc.perform(get("/api/session/abc").header("Authorization", token))
                .andExpect(status().isBadRequest());
    }

    // --- Création ------------------------------------------------------------

    @Test
    @DisplayName("POST /api/session crée une session")
    void create_createsSession() throws Exception {
        mockMvc.perform(post("/api/session").header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sessionDto("Nouvelle session"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.name").value("Nouvelle session"))
                .andExpect(jsonPath("$.teacher_id").value(teacher.getId()));

        assertThat(sessionRepository.findAll()).hasSize(1);
    }

    @Test
    @DisplayName("POST /api/session renvoie 400 si un champ obligatoire est absent")
    void create_missingField_returnsBadRequest() throws Exception {
        SessionDto dto = sessionDto("Nouvelle session");
        dto.setName(null);

        mockMvc.perform(post("/api/session").header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());

        assertThat(sessionRepository.findAll()).isEmpty();
    }

    @Test
    @DisplayName("POST /api/session renvoie 404 si le professeur n'existe pas")
    void create_unknownTeacher_returnsNotFound() throws Exception {
        SessionDto dto = sessionDto("Nouvelle session");
        dto.setTeacher_id(999999L);

        mockMvc.perform(post("/api/session").header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isNotFound());
    }

    // --- Modification --------------------------------------------------------

    @Test
    @DisplayName("PUT /api/session/{id} modifie la session")
    void update_updatesSession() throws Exception {
        Session session = createSession(teacher);

        mockMvc.perform(put("/api/session/{id}", session.getId()).header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sessionDto("Session modifiée"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(session.getId()))
                .andExpect(jsonPath("$.name").value("Session modifiée"));

        assertThat(sessionRepository.findById(session.getId()))
                .hasValueSatisfying(s -> assertThat(s.getName()).isEqualTo("Session modifiée"));
    }

    @Test
    @DisplayName("PUT /api/session/{id} renvoie 400 si un champ obligatoire est absent")
    void update_missingField_returnsBadRequest() throws Exception {
        Session session = createSession(teacher);
        SessionDto dto = sessionDto("Session modifiée");
        dto.setDescription(null);

        mockMvc.perform(put("/api/session/{id}", session.getId()).header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("PUT /api/session/{id} renvoie 404 si la session n'existe pas")
    void update_unknownId_returnsNotFound() throws Exception {
        mockMvc.perform(put("/api/session/{id}", 999999).header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sessionDto("Session modifiée"))))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("PUT /api/session/{id} renvoie 400 si l'identifiant n'est pas numérique")
    void update_invalidId_returnsBadRequest() throws Exception {
        mockMvc.perform(put("/api/session/abc").header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sessionDto("Session modifiée"))))
                .andExpect(status().isBadRequest());
    }

    // --- Suppression ---------------------------------------------------------

    @Test
    @DisplayName("DELETE /api/session/{id} supprime la session")
    void delete_deletesSession() throws Exception {
        Session session = createSession(teacher);

        mockMvc.perform(delete("/api/session/{id}", session.getId()).header("Authorization", token))
                .andExpect(status().isOk());

        assertThat(sessionRepository.findById(session.getId())).isEmpty();
    }

    @Test
    @DisplayName("DELETE /api/session/{id} renvoie 404 si la session n'existe pas")
    void delete_unknownId_returnsNotFound() throws Exception {
        mockMvc.perform(delete("/api/session/{id}", 999999).header("Authorization", token))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("DELETE /api/session/{id} renvoie 400 si l'identifiant n'est pas numérique")
    void delete_invalidId_returnsBadRequest() throws Exception {
        mockMvc.perform(delete("/api/session/abc").header("Authorization", token))
                .andExpect(status().isBadRequest());
    }

    // --- Participation -------------------------------------------------------

    @Test
    @DisplayName("POST /api/session/{id}/participate/{userId} inscrit l'utilisateur")
    void participate_addsUser() throws Exception {
        Session session = createSession(teacher);

        mockMvc.perform(post("/api/session/{id}/participate/{userId}", session.getId(), user.getId())
                        .header("Authorization", token))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/session/{id}", session.getId()).header("Authorization", token))
                .andExpect(jsonPath("$.users", hasSize(1)))
                .andExpect(jsonPath("$.users[0]").value(user.getId()));
    }

    @Test
    @DisplayName("POST /api/session/{id}/participate/{userId} renvoie 400 si l'utilisateur participe déjà")
    void participate_alreadyParticipating_returnsBadRequest() throws Exception {
        Session session = createSession(teacher);
        session.getUsers().add(user);
        sessionRepository.save(session);

        mockMvc.perform(post("/api/session/{id}/participate/{userId}", session.getId(), user.getId())
                        .header("Authorization", token))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/session/{id}/participate/{userId} renvoie 404 si l'utilisateur n'existe pas")
    void participate_unknownUser_returnsNotFound() throws Exception {
        Session session = createSession(teacher);

        mockMvc.perform(post("/api/session/{id}/participate/{userId}", session.getId(), 999999)
                        .header("Authorization", token))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("POST /api/session/{id}/participate/{userId} renvoie 400 si un identifiant n'est pas numérique")
    void participate_invalidId_returnsBadRequest() throws Exception {
        mockMvc.perform(post("/api/session/abc/participate/1").header("Authorization", token))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("DELETE /api/session/{id}/participate/{userId} désinscrit l'utilisateur")
    void noLongerParticipate_removesUser() throws Exception {
        Session session = createSession(teacher);
        session.getUsers().add(user);
        sessionRepository.save(session);

        mockMvc.perform(delete("/api/session/{id}/participate/{userId}", session.getId(), user.getId())
                        .header("Authorization", token))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/session/{id}", session.getId()).header("Authorization", token))
                .andExpect(jsonPath("$.users", hasSize(0)));
    }

    @Test
    @DisplayName("DELETE /api/session/{id}/participate/{userId} renvoie 400 si l'utilisateur ne participe pas")
    void noLongerParticipate_notParticipating_returnsBadRequest() throws Exception {
        Session session = createSession(teacher);

        mockMvc.perform(delete("/api/session/{id}/participate/{userId}", session.getId(), user.getId())
                        .header("Authorization", token))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("DELETE /api/session/{id}/participate/{userId} renvoie 404 si la session n'existe pas")
    void noLongerParticipate_unknownSession_returnsNotFound() throws Exception {
        mockMvc.perform(delete("/api/session/{id}/participate/{userId}", 999999, user.getId())
                        .header("Authorization", token))
                .andExpect(status().isNotFound());
    }
}
