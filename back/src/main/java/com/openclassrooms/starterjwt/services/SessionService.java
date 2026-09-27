package com.openclassrooms.starterjwt.services;

import com.openclassrooms.starterjwt.exception.BadRequestException;
import com.openclassrooms.starterjwt.exception.NotFoundException;
import com.openclassrooms.starterjwt.models.Session;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.SessionRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SessionService {
    private final SessionRepository sessionRepository;

    private final UserService userService;

    public SessionService(SessionRepository sessionRepository, UserService userService) {
        this.sessionRepository = sessionRepository;
        this.userService = userService;
    }

    public Session create(Session session) {
        return this.sessionRepository.save(session);
    }

    public void delete(Long id) {
        Session session = this.getById(id);
        this.sessionRepository.delete(session);
    }

    public List<Session> findAll() {
        return this.sessionRepository.findAll();
    }

    public Session getById(Long id) {
        return this.sessionRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Error: Session not found"));
    }

    public Session update(Long id, Session session) {
        this.getById(id);
        session.setId(id);
        return this.sessionRepository.save(session);
    }

    public void participate(Long id, Long userId) {
        Session session = this.getById(id);
        User user = this.userService.findById(userId);

        if (isParticipating(session, userId)) {
            throw new BadRequestException("Error: User already participates in this session");
        }

        session.getUsers().add(user);

        this.sessionRepository.save(session);
    }

    public void noLongerParticipate(Long id, Long userId) {
        Session session = this.getById(id);

        if (!isParticipating(session, userId)) {
            throw new BadRequestException("Error: User does not participate in this session");
        }

        session.setUsers(session.getUsers().stream().filter(user -> !user.getId().equals(userId)).collect(Collectors.toList()));

        this.sessionRepository.save(session);
    }

    private boolean isParticipating(Session session, Long userId) {
        return session.getUsers().stream().anyMatch(o -> o.getId().equals(userId));
    }
}
