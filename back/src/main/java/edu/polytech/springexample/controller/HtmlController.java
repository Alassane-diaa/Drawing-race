package edu.polytech.springexample.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HtmlController {

    @GetMapping(value = "/index.html")
    private String index(){return "index";}
}
