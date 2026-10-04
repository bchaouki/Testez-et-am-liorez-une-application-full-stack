package com.openclassrooms.starterjwt.mapper;

import com.openclassrooms.starterjwt.dto.SessionDto;
import com.openclassrooms.starterjwt.models.Session;
import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.services.TeacherService;
import com.openclassrooms.starterjwt.services.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Date;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SessionMapperTest {

    @Mock
    private TeacherService teacherService;

    @Mock
    private UserService userService;

    private SessionMapperImpl mapper;

    @BeforeEach
    void setUp() {
        mapper = new SessionMapperImpl();
        mapper.teacherService = teacherService;
        mapper.userService = userService;
    }

    @Test
    @DisplayName("toEntity résout le professeur et les participants à partir de leurs identifiants")
    void toEntity_resolvesTeacherAndUsers() {
        Teacher teacher = new Teacher().setId(5L);
        User user = new User("john@test.com", "Doe", "John", "pwd", false).setId(7L);
        when(teacherService.findById(5L)).thenReturn(teacher);
        when(userService.findById(7L)).thenReturn(user);
        Date date = new Date();
        SessionDto dto = new SessionDto(1L, "Yoga", date, 5L, "Description", List.of(7L), null, null);

        Session session = mapper.toEntity(dto);

        assertThat(session.getId()).isEqualTo(1L);
        assertThat(session.getName()).isEqualTo("Yoga");
        assertThat(session.getDate()).isEqualTo(date);
        assertThat(session.getDescription()).isEqualTo("Description");
        assertThat(session.getTeacher()).isEqualTo(teacher);
        assertThat(session.getUsers()).containsExactly(user);
    }

    @Test
    @DisplayName("toEntity sans professeur ni participants donne teacher=null et une liste vide")
    void toEntity_withoutTeacherAndUsers() {
        SessionDto dto = new SessionDto(1L, "Yoga", new Date(), null, "Description", null, null, null);

        Session session = mapper.toEntity(dto);

        assertThat(session.getTeacher()).isNull();
        assertThat(session.getUsers()).isEmpty();
        verifyNoInteractions(teacherService, userService);
    }

    @Test
    @DisplayName("toDto convertit le professeur et les participants en identifiants")
    void toDto_mapsTeacherAndUsersToIds() {
        User user = new User("john@test.com", "Doe", "John", "pwd", false).setId(7L);
        Session session = new Session().setId(1L).setName("Yoga").setDescription("Description")
                .setTeacher(new Teacher().setId(5L)).setUsers(List.of(user));

        SessionDto dto = mapper.toDto(session);

        assertThat(dto.getId()).isEqualTo(1L);
        assertThat(dto.getName()).isEqualTo("Yoga");
        assertThat(dto.getTeacher_id()).isEqualTo(5L);
        assertThat(dto.getUsers()).containsExactly(7L);
    }

    @Test
    @DisplayName("toDto sans professeur ni participants donne teacher_id=null et une liste vide")
    void toDto_withoutTeacherAndUsers() {
        Session session = new Session().setId(1L).setName("Yoga");

        SessionDto dto = mapper.toDto(session);

        assertThat(dto.getTeacher_id()).isNull();
        assertThat(dto.getUsers()).isEmpty();
    }

    @Test
    @DisplayName("les listes sont converties élément par élément")
    void lists_areMapped() {
        Session session = new Session().setId(1L).setName("Yoga");
        SessionDto dto = new SessionDto(2L, "Pilates", new Date(), null, "Description", null, null, null);

        assertThat(mapper.toDto(List.of(session))).extracting(SessionDto::getId).containsExactly(1L);
        assertThat(mapper.toEntity(List.of(dto))).extracting(Session::getId).containsExactly(2L);
    }

    @Test
    @DisplayName("les valeurs null donnent null")
    void nulls_returnNull() {
        assertThat(mapper.toDto((Session) null)).isNull();
        assertThat(mapper.toEntity((SessionDto) null)).isNull();
        assertThat(mapper.toDto((List<Session>) null)).isNull();
        assertThat(mapper.toEntity((List<SessionDto>) null)).isNull();
    }
}
