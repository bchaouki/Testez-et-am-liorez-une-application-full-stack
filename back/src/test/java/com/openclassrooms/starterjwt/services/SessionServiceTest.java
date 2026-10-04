package com.openclassrooms.starterjwt.services;

import com.openclassrooms.starterjwt.exception.BadRequestException;
import com.openclassrooms.starterjwt.exception.NotFoundException;
import com.openclassrooms.starterjwt.models.Session;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.SessionRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SessionServiceTest {

    @Mock
    private SessionRepository sessionRepository;

    @Mock
    private UserService userService;

    @InjectMocks
    private SessionService sessionService;

    private Session session(User... users) {
        return new Session().setId(1L).setName("Yoga").setUsers(new ArrayList<>(List.of(users)));
    }

    private User user(Long id) {
        return new User("u" + id + "@test.com", "Doe", "John", "encoded", false).setId(id);
    }

    @Test
    @DisplayName("create enregistre la session")
    void create_savesSession() {
        Session session = session();
        when(sessionRepository.save(session)).thenReturn(session);

        assertThat(sessionService.create(session)).isEqualTo(session);
    }

    @Test
    @DisplayName("findAll renvoie toutes les sessions")
    void findAll_returnsSessions() {
        List<Session> sessions = List.of(session());
        when(sessionRepository.findAll()).thenReturn(sessions);

        assertThat(sessionService.findAll()).isEqualTo(sessions);
    }

    @Test
    @DisplayName("getById renvoie la session si elle existe")
    void getById_existing_returnsSession() {
        Session session = session();
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));

        assertThat(sessionService.getById(1L)).isEqualTo(session);
    }

    @Test
    @DisplayName("getById lève NotFoundException si la session n'existe pas")
    void getById_missing_throwsNotFound() {
        when(sessionRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> sessionService.getById(1L))
                .isInstanceOf(NotFoundException.class)
                .hasMessage("Error: Session not found");
    }

    @Test
    @DisplayName("delete supprime la session si elle existe")
    void delete_existing_deletesSession() {
        Session session = session();
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));

        sessionService.delete(1L);

        verify(sessionRepository).delete(session);
    }

    @Test
    @DisplayName("delete lève NotFoundException si la session n'existe pas")
    void delete_missing_throwsNotFound() {
        when(sessionRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> sessionService.delete(1L)).isInstanceOf(NotFoundException.class);
        verify(sessionRepository, never()).delete(any());
    }

    @Test
    @DisplayName("update enregistre la session avec l'identifiant fourni")
    void update_existing_savesWithId() {
        Session updated = new Session().setName("Nouveau nom");
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session()));
        when(sessionRepository.save(updated)).thenReturn(updated);

        Session result = sessionService.update(1L, updated);

        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getName()).isEqualTo("Nouveau nom");
    }

    @Test
    @DisplayName("update lève NotFoundException si la session n'existe pas")
    void update_missing_throwsNotFound() {
        when(sessionRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> sessionService.update(1L, new Session())).isInstanceOf(NotFoundException.class);
        verify(sessionRepository, never()).save(any());
    }

    @Test
    @DisplayName("participate ajoute l'utilisateur à la session")
    void participate_addsUser() {
        Session session = session(user(2L));
        User user = user(1L);
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));
        when(userService.findById(1L)).thenReturn(user);

        sessionService.participate(1L, 1L);

        assertThat(session.getUsers()).contains(user);
        verify(sessionRepository).save(session);
    }

    @Test
    @DisplayName("participate lève BadRequestException si l'utilisateur participe déjà")
    void participate_alreadyParticipating_throwsBadRequest() {
        User user = user(1L);
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session(user)));
        when(userService.findById(1L)).thenReturn(user);

        assertThatThrownBy(() -> sessionService.participate(1L, 1L)).isInstanceOf(BadRequestException.class);
        verify(sessionRepository, never()).save(any());
    }

    @Test
    @DisplayName("participate lève NotFoundException si la session n'existe pas")
    void participate_missingSession_throwsNotFound() {
        when(sessionRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> sessionService.participate(1L, 1L)).isInstanceOf(NotFoundException.class);
    }

    @Test
    @DisplayName("participate propage NotFoundException si l'utilisateur n'existe pas")
    void participate_missingUser_throwsNotFound() {
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session()));
        when(userService.findById(1L)).thenThrow(new NotFoundException());

        assertThatThrownBy(() -> sessionService.participate(1L, 1L)).isInstanceOf(NotFoundException.class);
        verify(sessionRepository, never()).save(any());
    }

    @Test
    @DisplayName("noLongerParticipate retire l'utilisateur de la session")
    void noLongerParticipate_removesUser() {
        User other = user(2L);
        Session session = session(user(1L), other);
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));

        sessionService.noLongerParticipate(1L, 1L);

        assertThat(session.getUsers()).containsExactly(other);
        verify(sessionRepository).save(session);
    }

    @Test
    @DisplayName("noLongerParticipate lève BadRequestException si l'utilisateur ne participe pas")
    void noLongerParticipate_notParticipating_throwsBadRequest() {
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session(user(2L))));

        assertThatThrownBy(() -> sessionService.noLongerParticipate(1L, 1L)).isInstanceOf(BadRequestException.class);
        verify(sessionRepository, never()).save(any());
    }

    @Test
    @DisplayName("noLongerParticipate lève NotFoundException si la session n'existe pas")
    void noLongerParticipate_missingSession_throwsNotFound() {
        when(sessionRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> sessionService.noLongerParticipate(1L, 1L)).isInstanceOf(NotFoundException.class);
    }
}
