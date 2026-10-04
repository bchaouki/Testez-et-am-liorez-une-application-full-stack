package com.openclassrooms.starterjwt.mapper;

import com.openclassrooms.starterjwt.dto.UserDto;
import com.openclassrooms.starterjwt.models.User;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class UserMapperTest {

    private final UserMapper mapper = new UserMapperImpl();

    @Test
    @DisplayName("toDto copie tous les champs de l'utilisateur")
    void toDto_mapsAllFields() {
        LocalDateTime now = LocalDateTime.now();
        User user = new User("john@test.com", "Doe", "John", "pwd", true)
                .setId(1L).setCreatedAt(now).setUpdatedAt(now);

        UserDto dto = mapper.toDto(user);

        assertThat(dto.getId()).isEqualTo(1L);
        assertThat(dto.getEmail()).isEqualTo("john@test.com");
        assertThat(dto.getLastName()).isEqualTo("Doe");
        assertThat(dto.getFirstName()).isEqualTo("John");
        assertThat(dto.getPassword()).isEqualTo("pwd");
        assertThat(dto.isAdmin()).isTrue();
        assertThat(dto.getCreatedAt()).isEqualTo(now);
        assertThat(dto.getUpdatedAt()).isEqualTo(now);
    }

    @Test
    @DisplayName("toEntity copie tous les champs du DTO")
    void toEntity_mapsAllFields() {
        UserDto dto = new UserDto(1L, "john@test.com", "Doe", "John", false, "pwd", null, null);

        User user = mapper.toEntity(dto);

        assertThat(user.getId()).isEqualTo(1L);
        assertThat(user.getEmail()).isEqualTo("john@test.com");
        assertThat(user.getLastName()).isEqualTo("Doe");
        assertThat(user.getFirstName()).isEqualTo("John");
        assertThat(user.getPassword()).isEqualTo("pwd");
        assertThat(user.isAdmin()).isFalse();
    }

    @Test
    @DisplayName("les listes sont converties élément par élément")
    void lists_areMapped() {
        User user = new User("john@test.com", "Doe", "John", "pwd", false).setId(1L);
        UserDto dto = new UserDto(2L, "jane@test.com", "Smith", "Jane", false, "pwd", null, null);

        assertThat(mapper.toDto(List.of(user))).extracting(UserDto::getId).containsExactly(1L);
        assertThat(mapper.toEntity(List.of(dto))).extracting(User::getId).containsExactly(2L);
    }

    @Test
    @DisplayName("les valeurs null donnent null")
    void nulls_returnNull() {
        assertThat(mapper.toDto((User) null)).isNull();
        assertThat(mapper.toEntity((UserDto) null)).isNull();
        assertThat(mapper.toDto((List<User>) null)).isNull();
        assertThat(mapper.toEntity((List<UserDto>) null)).isNull();
    }
}
