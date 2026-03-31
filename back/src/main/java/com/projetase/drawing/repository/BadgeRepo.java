package com.projetase.drawing.repository;

import com.projetase.drawing.model.Badge;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BadgeRepo extends JpaRepository<Badge, Long> {
}