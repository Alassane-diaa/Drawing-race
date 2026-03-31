package com.projetase.drawing.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI drawingOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Drawing API")
                        .description("API backend du projet Advanced Software Engineering")
                        .version("v1")
                        .contact(new Contact()
                                .name("Projet ASE Team"))
                        .license(new License()
                                .name("Internal Project")));
    }
}