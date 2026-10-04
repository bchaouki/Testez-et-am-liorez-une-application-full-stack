package com.openclassrooms.starterjwt.mapper;

import com.openclassrooms.starterjwt.dto.TeacherDto;
import com.openclassrooms.starterjwt.models.Teacher;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class TeacherMapperTest {

    private final TeacherMapper mapper = new TeacherMapperImpl();

    @Test
    @DisplayName("toDto / toEntity conservent les champs du professeur")
    void roundTrip_mapsFields() {
        Teacher teacher = new Teacher().setId(1L).setFirstName("Margot").setLastName("Delahaye");

        TeacherDto dto = mapper.toDto(teacher);
        Teacher back = mapper.toEntity(dto);

        assertThat(dto.getId()).isEqualTo(1L);
        assertThat(dto.getFirstName()).isEqualTo("Margot");
        assertThat(dto.getLastName()).isEqualTo("Delahaye");
        assertThat(back.getId()).isEqualTo(1L);
        assertThat(back.getFirstName()).isEqualTo("Margot");
        assertThat(back.getLastName()).isEqualTo("Delahaye");
    }

    @Test
    @DisplayName("les listes sont converties élément par élément")
    void lists_areMapped() {
        Teacher teacher = new Teacher().setId(1L).setFirstName("Margot").setLastName("Delahaye");

        List<TeacherDto> dtos = mapper.toDto(List.of(teacher));

        assertThat(dtos).extracting(TeacherDto::getId).containsExactly(1L);
        assertThat(mapper.toEntity(dtos)).extracting(Teacher::getId).containsExactly(1L);
    }

    @Test
    @DisplayName("les valeurs null donnent null")
    void nulls_returnNull() {
        assertThat(mapper.toDto((Teacher) null)).isNull();
        assertThat(mapper.toEntity((TeacherDto) null)).isNull();
        assertThat(mapper.toDto((List<Teacher>) null)).isNull();
        assertThat(mapper.toEntity((List<TeacherDto>) null)).isNull();
    }
}
