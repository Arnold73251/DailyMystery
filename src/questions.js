export const riddleSets = {
    easy: [
        {
            question:
                "🌍 QUESTION NORMALE — Quelle est la capitale de la France ?",
            answers: ["paris"],
            correctAnswer: "Paris",
            hint: "C'est aussi la plus grande ville de France."
        },

        {
            type: "truefalse",
            question: "Les dauphins sont des mammifères.",
            answers: ["vrai"],
            correctAnswer: "Vrai",
            hint: "Ils respirent de l'air avec des poumons."
        },

        {
            question:
                "🎯 QUESTION PIÈGE — Combien de mois ont exactement 28 jours ?",
            answers: ["1", "un"],
            correctAnswer: "1",
            hint: "La question dit « exactement 28 jours »."
        },

        {
            question:
                "🔢 CALCUL RAPIDE — Combien font 15 × 4 ?",
            answers: ["60", "soixante"],
            correctAnswer: "60",
            hint: "15 × 2 = 30. Double encore une fois."
        },

        {
            question:
                "🧩 DEVINETTE — Je suis jaune, je brille dans le ciel et je donne de la lumière. Qui suis-je ?",
            answers: ["soleil", "le soleil", "un soleil"],
            correctAnswer: "Le Soleil",
            hint: "On me voit surtout pendant la journée."
        }
    ],

    medium: [
        {
            question:
                "🌍 CULTURE GÉNÉRALE — Quel est le plus grand océan du monde ?",
            answers: [
                "pacifique",
                "océan pacifique",
                "ocean pacifique"
            ],
            correctAnswer: "L'océan Pacifique",
            hint: "Son nom commence par « P »."
        },

        {
            type: "truefalse",
            question: "La Lune produit sa propre lumière.",
            answers: ["faux"],
            correctAnswer: "Faux",
            hint: "Elle semble briller parce qu'elle réfléchit une autre lumière."
        },

        {
            question:
                "🧩 PUZZLE — Une classe compte 30 élèves. 18 font du football et 12 font du tennis. Combien font au total un de ces deux sports si aucun élève ne fait les deux ?",
            answers: [
                "30",
                "trente",
                "30 élèves",
                "trente élèves"
            ],
            correctAnswer: "30",
            hint: "Il suffit d'additionner les deux groupes."
        },

        {
            question:
                "🔎 SUITE LOGIQUE — Quel nombre vient ensuite : 2, 4, 8, 16, ... ?",
            answers: ["32", "trente deux", "trente-deux"],
            correctAnswer: "32",
            hint: "Chaque nombre est multiplié par 2."
        },

        {
            question:
                "🎯 ATTENTION — Tu dépasses la personne qui est 2e dans une course. À quelle place es-tu ?",
            answers: [
                "2",
                "deux",
                "deuxième",
                "2e"
            ],
            correctAnswer: "2e",
            hint: "Tu prends la place de la personne que tu dépasses."
        }
    ],

    hard: [
        {
            question:
                "🧠 PUZZLE — Une bouteille et un bouchon coûtent 1,10 €. La bouteille coûte 1 € de plus que le bouchon. Combien coûte le bouchon ?",
            answers: [
                "0,05",
                "0.05",
                "5 centimes",
                "5 cents",
                "0,05 €"
            ],
            correctAnswer: "0,05 €",
            hint: "Si le bouchon coûte 5 centimes, la bouteille coûte 1,05 €."
        },

        {
            question:
                "🌍 CULTURE GÉNÉRALE — Quelle planète est la plus proche du Soleil ?",
            answers: ["mercure"],
            correctAnswer: "Mercure",
            hint: "Son nom commence par « Merc... »."
        },

        {
            type: "truefalse",
            question: "Un triangle peut avoir quatre côtés.",
            answers: ["faux"],
            correctAnswer: "Faux",
            hint: "Le mot « triangle » donne déjà une indication."
        },

        {
            question:
                "🕵️ QUESTION PIÈGE — Un train électrique roule vers le nord. Le vent souffle vers le sud. De quel côté part la fumée ?",
            answers: [
                "nulle part",
                "aucune part",
                "il n'y en a pas",
                "pas de fumée"
            ],
            correctAnswer: "Nulle part",
            hint: "Relis attentivement le premier mot important de la question."
        },

        {
            question:
                "🧩 PUZZLE — Tu as 8 boules identiques, sauf une qui est plus lourde. Avec une balance à deux plateaux, quel est le nombre minimum de pesées pour trouver la boule lourde ?",
            answers: [
                "2",
                "deux",
                "2 pesées",
                "deux pesées"
            ],
            correctAnswer: "2 pesées",
            hint: "Divise les 8 boules en groupes et utilise la balance intelligemment."
        }
    ]
};