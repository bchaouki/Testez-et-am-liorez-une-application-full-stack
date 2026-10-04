package com.openclassrooms.starterjwt.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.openclassrooms.starterjwt.models.Session;
import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.SessionRepository;
import com.openclassrooms.starterjwt.repository.TeacherRepository;
import com.openclassrooms.starterjwt.repository.UserRepository;
import com.openclassrooms.starterjwt.security.jwt.JwtUtils;
import com.openclassrooms.starterjwt.security.services.UserDetailsImpl;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.MySQLContainer;

import java.util.ArrayList;
import java.util.Date;

/**
 * Base des tests d'intégration : contexte Spring Boot complet + base MySQL réelle (Testcontainers).
 * Le conteneur est partagé par toutes les classes de test (pattern singleton) pour
 * profiter du cache de contexte Spring.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public abstract class AbstractIntegrationTest {

    @ServiceConnection
    static final MySQLContainer<?> MYSQL = new MySQLContainer<>("mysql:8.4");

    static {
        MYSQL.start();
    }

    protected static final String PASSWORD = "test!1234";

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected ObjectMapper objectMapper;

    @Autowired
    protected UserRepository userRepository;

    @Autowired
    protected TeacherRepository teacherRepository;

    @Autowired
    protected SessionRepository sessionRepository;

    @Autowired
    protected PasswordEncoder passwordEncoder;

    @Autowired
    protected JwtUtils jwtUtils;

    @BeforeEach
    void cleanDatabase() {
        sessionRepository.deleteAll();
        teacherRepository.deleteAll();
        userRepository.deleteAll();
    }

    protected User createUser(String email, boolean admin) {
        return userRepository.save(new User(email, "Doe", "John", passwordEncoder.encode(PASSWORD), admin));
    }

    protected Teacher createTeacher() {
        return teacherRepository.save(Teacher.builder().firstName("Margot").lastName("Delahaye").build());
    }

    protected Session createSession(Teacher teacher) {
        return sessionRepository.save(Session.builder()
                .name("Yoga matinal")
                .date(new Date())
                .description("Séance de yoga du matin")
                .teacher(teacher)
                .users(new ArrayList<>())
                .build());
    }

    protected String bearer(User user) {
        UserDetailsImpl principal = UserDetailsImpl.builder()
                .id(user.getId())
                .username(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .password(user.getPassword())
                .build();
        String token = jwtUtils.generateJwtToken(new UsernamePasswordAuthenticationToken(principal, null));
        return "Bearer " + token;
    }
}
