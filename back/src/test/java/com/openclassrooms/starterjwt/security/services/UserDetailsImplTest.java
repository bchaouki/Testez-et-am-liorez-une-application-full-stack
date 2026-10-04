package com.openclassrooms.starterjwt.security.services;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class UserDetailsImplTest {

    private UserDetailsImpl user(Long id) {
        return UserDetailsImpl.builder().id(id).username("john@test.com").password("pwd").build();
    }

    @Test
    @DisplayName("le compte est toujours actif, non expiré, non verrouillé et sans autorités")
    void accountFlags_areAlwaysTrue() {
        UserDetailsImpl user = user(1L);

        assertThat(user.isAccountNonExpired()).isTrue();
        assertThat(user.isAccountNonLocked()).isTrue();
        assertThat(user.isCredentialsNonExpired()).isTrue();
        assertThat(user.isEnabled()).isTrue();
        assertThat(user.getAuthorities()).isEmpty();
    }

    @Test
    @DisplayName("equals compare les utilisateurs par identifiant")
    void equals_comparesById() {
        UserDetailsImpl user = user(1L);

        assertThat(user).isEqualTo(user);
        assertThat(user).isEqualTo(user(1L));
        assertThat(user).isNotEqualTo(user(2L));
        assertThat(user).isNotEqualTo(null);
        assertThat(user).isNotEqualTo("john@test.com");
    }
}
