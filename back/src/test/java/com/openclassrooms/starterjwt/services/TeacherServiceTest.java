package com.openclassrooms.starterjwt.services;

import com.openclassrooms.starterjwt.exception.NotFoundException;
import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.repository.TeacherRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TeacherServiceTest {

    @Mock
    private TeacherRepository teacherRepository;

    @InjectMocks
    private TeacherService teacherService;

    @Test
    @DisplayName("findAll renvoie tous les professeurs du repository")
    void findAll_returnsAllTeachers() {
        List<Teacher> teachers = List.of(new Teacher().setId(1L), new Teacher().setId(2L));
        when(teacherRepository.findAll()).thenReturn(teachers);

        assertThat(teacherService.findAll()).isEqualTo(teachers);
    }

    @Test
    @DisplayName("findById renvoie le professeur s'il existe")
    void findById_existing_returnsTeacher() {
        Teacher teacher = new Teacher().setId(1L).setFirstName("Margot");
        when(teacherRepository.findById(1L)).thenReturn(Optional.of(teacher));

        assertThat(teacherService.findById(1L)).isEqualTo(teacher);
    }

    @Test
    @DisplayName("findById lève NotFoundException si le professeur n'existe pas")
    void findById_missing_throwsNotFound() {
        when(teacherRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> teacherService.findById(1L))
                .isInstanceOf(NotFoundException.class)
                .hasMessage("Error: Teacher not found");
    }
}
