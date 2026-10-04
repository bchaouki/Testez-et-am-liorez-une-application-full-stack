package com.openclassrooms.starterjwt.services;

import com.openclassrooms.starterjwt.exception.BadRequestException;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.payload.request.LoginRequest;
import com.openclassrooms.starterjwt.payload.request.SignupRequest;
import com.openclassrooms.starterjwt.payload.response.JwtResponse;
import com.openclassrooms.starterjwt.repository.UserRepository;
import com.openclassrooms.starterjwt.security.jwt.JwtUtils;
import com.openclassrooms.starterjwt.security.services.UserDetailsImpl;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtUtils jwtUtils;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AuthService authService;

    @AfterEach
    void clearContext() {
        SecurityContextHolder.clearContext();
    }

    private LoginRequest loginRequest() {
        LoginRequest request = new LoginRequest();
        request.setEmail("yoga@studio.com");
        request.setPassword("test!1234");
        return request;
    }

    private Authentication mockAuthentication() {
        UserDetailsImpl principal = UserDetailsImpl.builder()
                .id(1L).username("yoga@studio.com").firstName("Admin").lastName("Yoga").build();
        Authentication authentication = new UsernamePasswordAuthenticationToken(principal, null);
        when(authenticationManager.authenticate(any())).thenReturn(authentication);
        when(jwtUtils.generateJwtToken(authentication)).thenReturn("jwt-token");
        return authentication;
    }

    @Test
    @DisplayName("authenticate renvoie un JwtResponse avec admin=true pour un administrateur")
    void authenticate_admin_returnsJwtResponse() {
        Authentication authentication = mockAuthentication();
        when(userRepository.findByEmail("yoga@studio.com"))
                .thenReturn(Optional.of(new User("yoga@studio.com", "Yoga", "Admin", "pwd", true)));

        JwtResponse response = authService.authenticate(loginRequest());

        assertThat(response.getToken()).isEqualTo("jwt-token");
        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getUsername()).isEqualTo("yoga@studio.com");
        assertThat(response.getFirstName()).isEqualTo("Admin");
        assertThat(response.getLastName()).isEqualTo("Yoga");
        assertThat(response.getAdmin()).isTrue();
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isEqualTo(authentication);
    }

    @Test
    @DisplayName("authenticate renvoie admin=false si l'utilisateur n'est pas retrouvé")
    void authenticate_userNotFound_returnsAdminFalse() {
        mockAuthentication();
        when(userRepository.findByEmail("yoga@studio.com")).thenReturn(Optional.empty());

        assertThat(authService.authenticate(loginRequest()).getAdmin()).isFalse();
    }

    @Test
    @DisplayName("authenticate propage l'exception en cas de mauvais identifiants")
    void authenticate_badCredentials_throws() {
        when(authenticationManager.authenticate(any())).thenThrow(new BadCredentialsException("Bad credentials"));

        assertThatThrownBy(() -> authService.authenticate(loginRequest()))
                .isInstanceOf(BadCredentialsException.class);
    }

    @Test
    @DisplayName("register enregistre un nouvel utilisateur non admin avec mot de passe encodé")
    void register_newEmail_savesUser() {
        SignupRequest request = new SignupRequest();
        request.setEmail("jane@test.com");
        request.setFirstName("Jane");
        request.setLastName("Smith");
        request.setPassword("password123");
        when(userRepository.existsByEmail("jane@test.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encoded");

        authService.register(request);

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        User saved = captor.getValue();
        assertThat(saved.getEmail()).isEqualTo("jane@test.com");
        assertThat(saved.getFirstName()).isEqualTo("Jane");
        assertThat(saved.getLastName()).isEqualTo("Smith");
        assertThat(saved.getPassword()).isEqualTo("encoded");
        assertThat(saved.isAdmin()).isFalse();
    }

    @Test
    @DisplayName("register lève BadRequestException si l'email est déjà utilisé")
    void register_existingEmail_throwsBadRequest() {
        SignupRequest request = new SignupRequest();
        request.setEmail("jane@test.com");
        when(userRepository.existsByEmail("jane@test.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("Error: Email is already taken!");
        verify(userRepository, never()).save(any());
    }
}
