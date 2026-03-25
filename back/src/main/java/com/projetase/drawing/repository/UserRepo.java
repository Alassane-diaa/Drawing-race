package com.projetase.drawing.repository;

import com.projetase.drawing.model.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepo extends JpaRepository<AppUser, Long> {
    Optional<AppUser> findByUsername(String username);

    List<AppUser> findAllByOrderByWinsDesc();
}
