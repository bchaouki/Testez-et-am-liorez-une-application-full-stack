package com.openclassrooms.starterjwt.services;

import com.openclassrooms.starterjwt.exception.NotFoundException;
import com.openclassrooms.starterjwt.exception.UnauthorizedException;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Objects;

@Service
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Supprime un utilisateur après avoir vérifié qu'il existe
     * et que l'utilisateur authentifié est bien son propriétaire.
     */
    public void delete(Long id, String authenticatedEmail) {
        User user = this.findById(id);

        if (!Objects.equals(authenticatedEmail, user.getEmail())) {
            throw new UnauthorizedException("Error: You can only delete your own account");
        }

        this.userRepository.deleteById(id);
    }

    public User findById(Long id) {
        return this.userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Error: User not found"));
    }
}
