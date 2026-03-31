package com.projetase.drawing.controller;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin
@RestController
public class TestController {


    @GetMapping(value = "/testUser", produces = "text/plain")
    public String testUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return "Bonjour user "+authentication.getName();
    }

    @GetMapping(value = "/testAdmin", produces = "text/plain")
    public String testAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return "Bonjour admin "+authentication.getName();
    }
}
