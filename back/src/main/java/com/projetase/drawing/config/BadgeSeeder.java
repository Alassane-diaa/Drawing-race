package com.projetase.drawing.config;

import com.projetase.drawing.model.Badge;
import com.projetase.drawing.repository.BadgeRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.IntStream;

@Slf4j
@Component
@RequiredArgsConstructor
public class BadgeSeeder implements ApplicationRunner {

    private final BadgeRepo badgeRepo;

    // ── Liste des 50 badges ───────────────────────────────────────────────────
    // Remplace name/description par tes vraies données quand tu les auras.
    private static final List<String[]> BADGE_DEFINITIONS = List.of(
            new String[]{"Première victoire",     "Remporte ta première partie."},
            new String[]{"Habitué",               "Joue 10 parties."},
            new String[]{"Vétéran",               "Joue 50 parties."},
            new String[]{"Centurion",             "Joue 100 parties."},
            new String[]{"Tireur d'élite",        "Atteins 90% de précision."},
            new String[]{"Sniper",                "Atteins 95% de précision."},
            new String[]{"Perfectionniste",       "Atteins 100% de précision."},
            new String[]{"Série de 3",            "Enchaîne 3 victoires de suite."},
            new String[]{"Série de 5",            "Enchaîne 5 victoires de suite."},
            new String[]{"Série de 10",           "Enchaîne 10 victoires de suite."},
            new String[]{"Podium",                "Termine dans le top 3."},
            new String[]{"Champion",              "Remporte 10 parties."},
            new String[]{"Grand champion",        "Remporte 50 parties."},
            new String[]{"Légende",               "Remporte 100 parties."},
            new String[]{"Dessinateur débutant",  "Dessine pour la première fois."},
            new String[]{"Artiste en herbe",      "Dessine 10 fois."},
            new String[]{"Peintre confirmé",      "Dessine 50 fois."},
            new String[]{"Maître du trait",       "Dessine 100 fois."},
            new String[]{"Devineur chanceux",     "Devine au dernier moment."},
            new String[]{"Rapide comme l'éclair", "Devine en moins de 5 secondes."},
            new String[]{"Flash",                 "Devine en moins de 2 secondes."},
            new String[]{"Curieux",               "Consulte la page de stats."},
            new String[]{"Collectionneur",        "Débloque 10 badges."},
            new String[]{"Grand collectionneur",  "Débloque 25 badges."},
            new String[]{"Complétiste",           "Débloque tous les badges."},
            new String[]{"Noctambule",            "Joue après minuit."},
            new String[]{"Lève-tôt",              "Joue avant 7h du matin."},
            new String[]{"Fidèle",                "Joue 7 jours consécutifs."},
            new String[]{"Assidu",                "Joue 30 jours consécutifs."},
            new String[]{"Retour aux sources",    "Reviens après une absence de 30 jours."},
            new String[]{"Sociabl",               "Joue avec 5 joueurs différents."},
            new String[]{"Communautaire",         "Joue avec 20 joueurs différents."},
            new String[]{"Badge #33",             "Condition à définir."},
            new String[]{"Badge #34",             "Condition à définir."},
            new String[]{"Badge #35",             "Condition à définir."},
            new String[]{"Badge #36",             "Condition à définir."},
            new String[]{"Badge #37",             "Condition à définir."},
            new String[]{"Badge #38",             "Condition à définir."},
            new String[]{"Badge #39",             "Condition à définir."},
            new String[]{"Badge #40",             "Condition à définir."},
            new String[]{"Badge #41",             "Condition à définir."},
            new String[]{"Badge #42",             "Condition à définir."},
            new String[]{"Badge #43",             "Condition à définir."},
            new String[]{"Badge #44",             "Condition à définir."},
            new String[]{"Badge #45",             "Condition à définir."},
            new String[]{"Badge #46",             "Condition à définir."},
            new String[]{"Badge #47",             "Condition à définir."},
            new String[]{"Badge #48",             "Condition à définir."},
            new String[]{"Badge #49",             "Condition à définir."},
            new String[]{"Badge #50",             "Condition à définir."}
    );

    @Override
    public void run(ApplicationArguments args) {
        if (badgeRepo.count() > 0) {
            log.info("Badges déjà présents en BDD, seed ignoré.");
            return;
        }

        List<Badge> badges = BADGE_DEFINITIONS.stream()
                .map(def -> new Badge(null, def[0], def[1]))
                .toList();

        badgeRepo.saveAllAndFlush(badges);
        log.info("{} badges insérés en BDD.", badges.size());
    }
}
