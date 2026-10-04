package com.openclassrooms.starterjwt.services;

import com.openclassrooms.starterjwt.exception.NotFoundException;
import com.openclassrooms.starterjwt.exception.UnauthorizedException;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    private User user() {
        return new User("john@test.com", "Doe", "John", "encoded", false).setId(1L);
    }

    @Test
    @DisplayName("findById renvoie l'utilisateur s'il existe")
    void findById_existing_returnsUser() {
        User user = user();
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        assertThat(userService.findById(1L)).isEqualTo(user);
    }

    @Test
    @DisplayName("findById lève NotFoundException si l'utilisateur n'existe pas")
    void findById_missing_throwsNotFound() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.findById(1L))
                .isInstanceOf(NotFoundException.class)
                .hasMessage("Error: User not found");
    }

    @Test
    @DisplayName("delete supprime l'utilisateur quand il s'agit de son propre compte")
    void delete_ownAccount_deletesUser() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user()));

        userService.delete(1L, "john@test.com");

        verify(userRepository).deleteById(1L);
    }

    @Test
    @DisplayName("delete lève UnauthorizedException pour le compte d'un autre utilisateur")
    void delete_otherAccount_throwsUnauthorized() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user()));

        assertThatThrownBy(() -> userService.delete(1L, "other@test.com"))
                .isInstanceOf(UnauthorizedException.class);
        verify(userRepository, never()).deleteById(anyLong());
    }

    @Test
    @DisplayName("delete lève NotFoundException si l'utilisateur n'existe pas")
    void delete_missing_throwsNotFound() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.delete(1L, "john@test.com"))
                .isInstanceOf(NotFoundException.class);
        verify(userRepository, never()).deleteById(anyLong());
    }
}
