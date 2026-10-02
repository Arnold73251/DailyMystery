import "./style.css";

import { riddleSets } from "./questions.js";

import { getPoints } from "./points.js";

import {
    login,
    register
} from "./auth.js";

import {
    showProfileCreationPage
} from "./profile.js";

import {
    showAccountPage
} from "./compte.js";

import {
    onAuthStateChanged
} from "firebase/auth";

import { auth } from "./firebase.js";
import {
    saveDailyResult,
    getPointsRanking,
    getWinStreakRanking,
    getPlayerRank
} from "./ranking.js";

const app = document.querySelector("#app");


/* =========================================================
   PAGE D'ACCUEIL
========================================================= */

app.innerHTML = `
    <div class="site">

        <nav class="navbar">

            <div class="logo" id="homeLogo">
                DAILY<span>MYSTERY</span>
            </div>

            <div class="nav-links">

                <button id="navPlay">
                    JOUER
                </button>

                <button id="navModes">
                    MODES
                </button>

                <button id="navRanking">
                    CLASSEMENT
                </button>

            </div>

            <button
                class="login"
                id="loginButton"
            >
                SE CONNECTER
            </button>

        </nav>


        <section class="home">

            <div class="home-content">

                <div class="badge">
                    🕵️ LE JEU D'ÉNIGMES QUOTIDIEN
                </div>

                <h1>
                    PENSE.<br>
                    <span>DÉDUIS.</span><br>
                    TROUVE.
                </h1>

                <p>
                    Une énigme. Une chance. Un nouveau mystère chaque jour.
                </p>

                <button
                    class="play-button"
                    id="playButton"
                >
                    JOUER AU DAILY
                    <span>→</span>
                </button>

                <div class="home-stats">

                    <div>
                        <strong>5</strong>
                        <small>ÉNIGMES GRATUITES</small>
                    </div>

                    <div>
                        <strong>3</strong>
                        <small>DIFFICULTÉS</small>
                    </div>

                    <div>
                        <strong>🏆</strong>
                        <small>CLASSEMENT</small>
                    </div>

                </div>

            </div>


            <div class="mystery-visual">

                <div class="glow"></div>

                <div class="floating-card card-one">

                    <span>💡</span>

                    <div>
                        <small>INDICE</small>
                        <strong>?</strong>
                    </div>

                </div>


                <div class="mystery-circle">

                    <div class="question-mark">
                        ?
                    </div>

                </div>


                <div class="floating-card card-two">

                    <span>🏆</span>

                    <div>
                        <small>SCORE</small>
                        <strong>9 420</strong>
                    </div>

                </div>

            </div>

        </section>


        <section class="daily-preview">

            <div>

                <small>
                    MYSTÈRE DU JOUR
                </small>

                <h2>
                    Tu penses pouvoir le résoudre ?
                </h2>

            </div>

            <button id="previewPlay">
                ESSAYER →
            </button>

        </section>

    </div>
`;


/* =========================================================
   ELEMENTS DE LA PAGE D'ACCUEIL
========================================================= */

const playButton =
    document.querySelector("#playButton");

const previewPlay =
    document.querySelector("#previewPlay");

const navPlay =
    document.querySelector("#navPlay");
const navRanking =
    document.querySelector("#navRanking");
const logo =
    document.querySelector("#homeLogo");

const loginButton =
    document.querySelector("#loginButton");


/* =========================================================
   DAILY
========================================================= */

const dailyCompleted =
    localStorage.getItem(
        "dailyMysteryCompleted"
    ) === "true";


const savedScore =
    Number(
        localStorage.getItem(
            "dailyMysteryScore"
        )
    ) || 0;


let currentRiddle = 0;

let mistakes = 0;

let score = 0;

let timeLeft = 30;

let timerInterval = null;

let selectedDifficulty = null;


/* =========================================================
   DIFFICULTÉS
========================================================= */

const difficulties = {

    easy: {

        name: "FACILE",

        time: null,

        label: "TEMPS ILLIMITÉ"

    },

    medium: {

        name: "MOYEN",

        time: 60,

        label: "1 MINUTE"

    },

    hard: {

        name: "DIFFICILE",

        time: 30,

        label: "30 SECONDES"

    }

};


/* =========================================================
   OUTILS POUR LES RÉPONSES
========================================================= */

function cleanAnswer(answer) {

    return answer
        .toLowerCase()
        .trim()
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .replace(
            /[.,!?;:'"’`]/g,
            ""
        )
        .replace(
            /\s+/g,
            " "
        );

}


function removeArticles(answer) {

    return answer
        .replace(
            /^(le|la|les|un|une|des|l')\s+/i,
            ""
        )
        .trim();

}


function levenshtein(a, b) {

    const matrix = [];


    for (
        let i = 0;
        i <= b.length;
        i++
    ) {

        matrix[i] = [i];

    }


    for (
        let j = 0;
        j <= a.length;
        j++
    ) {

        matrix[0][j] = j;

    }


    for (
        let i = 1;
        i <= b.length;
        i++
    ) {

        for (
            let j = 1;
            j <= a.length;
            j++
        ) {

            if (
                b.charAt(i - 1) ===
                a.charAt(j - 1)
            ) {

                matrix[i][j] =
                    matrix[i - 1][j];

            } else {

                matrix[i][j] =
                    Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );

            }

        }

    }


    return matrix[b.length][a.length];

}


function isCorrectAnswer(
    answer,
    acceptedAnswers
) {

    const cleanedAnswer =
        cleanAnswer(answer);


    const answerWithoutArticle =
        removeArticles(
            cleanedAnswer
        );


    for (
        const accepted
        of acceptedAnswers
    ) {

        const cleanedAccepted =
            cleanAnswer(accepted);


        const acceptedWithoutArticle =
            removeArticles(
                cleanedAccepted
            );


        if (
            cleanedAnswer ===
            cleanedAccepted
        ) {

            return true;

        }


        if (
            answerWithoutArticle ===
            acceptedWithoutArticle
        ) {

            return true;

        }


        const distance =
            levenshtein(
                answerWithoutArticle,
                acceptedWithoutArticle
            );


        const maxDistance =
            acceptedWithoutArticle.length >= 7
                ? 2
                : 1;


        if (
            distance <= maxDistance &&
            answerWithoutArticle.length >=
                acceptedWithoutArticle.length - 2 &&
            answerWithoutArticle.length <=
                acceptedWithoutArticle.length + 2
        ) {

            return true;

        }

    }


    return false;

}


/* =========================================================
   PAGE DE CONNEXION
========================================================= */

function showLoginPage() {

    clearInterval(timerInterval);


    app.innerHTML = `

        <div class="site">

            <nav class="navbar">

                <div
                    class="logo"
                    id="authLogo"
                >
                    DAILY<span>MYSTERY</span>
                </div>

                <button
                    class="back-button"
                    id="authBack"
                >
                    ← ACCUEIL
                </button>

            </nav>


            <main class="auth-page">

                <div class="auth-container">

                    <div class="auth-card">

                        <div class="auth-label">
                            DAILY MYSTERY
                        </div>


                        <h1>
                            SE <span>CONNECTER</span>
                        </h1>


                        <p class="auth-description">
                            Connecte-toi pour retrouver ton compte Daily Mystery.
                        </p>


                        <form
                            id="loginForm"
                            class="auth-form"
                        >

                            <label for="loginEmail">
                                E-MAIL
                            </label>

                            <input
                                id="loginEmail"
                                type="email"
                                placeholder="ton@email.com"
                                autocomplete="email"
                                required
                            >


                            <label for="loginPassword">
                                MOT DE PASSE
                            </label>

                            <input
                                id="loginPassword"
                                type="password"
                                placeholder="Ton mot de passe"
                                autocomplete="current-password"
                                required
                            >


                            <button
                                type="submit"
                                class="auth-button"
                            >
                                SE CONNECTER
                            </button>

                        </form>


                        <p
                            id="loginError"
                            class="auth-error"
                        ></p>


                        <div class="auth-switch">

                            Pas encore de compte ?

                            <button id="goRegister">
                                CRÉER UN COMPTE
                            </button>

                        </div>

                    </div>

                </div>

            </main>

        </div>

    `;


    document
        .querySelector("#authLogo")
        .addEventListener(
            "click",
            () => location.reload()
        );


    document
        .querySelector("#authBack")
        .addEventListener(
            "click",
            () => location.reload()
        );


    document
        .querySelector("#goRegister")
        .addEventListener(
            "click",
            showRegisterPage
        );


    document
        .querySelector("#loginForm")
        .addEventListener(
            "submit",
            async (event) => {

                event.preventDefault();


                const email =
                    document
                        .querySelector("#loginEmail")
                        .value
                        .trim();


                const password =
                    document
                        .querySelector("#loginPassword")
                        .value;


                const errorElement =
                    document.querySelector(
                        "#loginError"
                    );


                errorElement.textContent =
                    "Connexion...";


                const result =
                    await login(
                        email,
                        password
                    );


                if (result.success) {

                    location.reload();

                } else {

                    errorElement.textContent =
                        result.message;

                }

            }
        );

}


/* =========================================================
   PAGE CRÉATION DE COMPTE
========================================================= */

function showRegisterPage() {

    clearInterval(timerInterval);


    app.innerHTML = `

        <div class="site">

            <nav class="navbar">

                <div
                    class="logo"
                    id="authLogo"
                >
                    DAILY<span>MYSTERY</span>
                </div>


                <button
                    class="back-button"
                    id="authBack"
                >
                    ← ACCUEIL
                </button>

            </nav>


            <main class="auth-page">

                <div class="auth-container">

                    <div class="auth-card">

                        <div class="auth-label">
                            DAILY MYSTERY
                        </div>


                        <h1>
                            CRÉER <span>UN COMPTE</span>
                        </h1>


                        <p class="auth-description">
                            Crée ton compte pour retrouver ton profil Daily Mystery.
                        </p>


                        <form
                            id="registerForm"
                            class="auth-form"
                        >

                            <label for="registerEmail">
                                E-MAIL
                            </label>

                            <input
                                id="registerEmail"
                                type="email"
                                placeholder="ton@email.com"
                                autocomplete="email"
                                required
                            >


                            <label for="registerPassword">
                                MOT DE PASSE
                            </label>

                            <input
                                id="registerPassword"
                                type="password"
                                placeholder="Minimum 6 caractères"
                                autocomplete="new-password"
                                minlength="6"
                                required
                            >


                            <label for="registerConfirm">
                                CONFIRMER LE MOT DE PASSE
                            </label>

                            <input
                                id="registerConfirm"
                                type="password"
                                placeholder="Retape ton mot de passe"
                                autocomplete="new-password"
                                minlength="6"
                                required
                            >


                            <button
                                type="submit"
                                class="auth-button"
                            >
                                CRÉER MON COMPTE
                            </button>

                        </form>


                        <p
                            id="registerError"
                            class="auth-error"
                        ></p>


                        <div class="auth-switch">

                            Déjà un compte ?

                            <button id="goLogin">
                                SE CONNECTER
                            </button>

                        </div>

                    </div>

                </div>

            </main>

        </div>

    `;


    document
        .querySelector("#authLogo")
        .addEventListener(
            "click",
            () => location.reload()
        );


    document
        .querySelector("#authBack")
        .addEventListener(
            "click",
            () => location.reload()
        );


    document
        .querySelector("#goLogin")
        .addEventListener(
            "click",
            showLoginPage
        );


    document
        .querySelector("#registerForm")
        .addEventListener(
            "submit",
            async (event) => {

                event.preventDefault();


                const email =
                    document
                        .querySelector("#registerEmail")
                        .value
                        .trim();


                const password =
                    document
                        .querySelector("#registerPassword")
                        .value;


                const confirmPassword =
                    document
                        .querySelector("#registerConfirm")
                        .value;


                const errorElement =
                    document.querySelector(
                        "#registerError"
                    );


                if (
                    password !==
                    confirmPassword
                ) {

                    errorElement.textContent =
                        "Les deux mots de passe ne correspondent pas.";

                    return;

                }


                errorElement.textContent =
                    "Création du compte...";


                const result =
                    await register(
                        email,
                        password
                    );


                if (result.success) {

                    showProfileCreationPage(
                        app,
                        timerInterval
                    );

                } else {

                    errorElement.textContent =
                        result.message;

                }

            }
        );

}


/* =========================================================
   PAGE CHOIX DE DIFFICULTÉ
========================================================= */

function showDifficultySelection() {

    if (!auth.currentUser) {

        showLoginPage();

        return;

    }


    if (
        localStorage.getItem(
            "dailyMysteryCompleted"
        ) === "true"
    ) {

        showEndScreen();

        return;

    }


    app.innerHTML = `

        <div class="game-page">

            <nav class="navbar">

                <div
                    class="logo"
                    id="difficultyLogo"
                >
                    DAILY<span>MYSTERY</span>
                </div>


                <button
                    class="back-button"
                    id="difficultyBack"
                >
                    ← ACCUEIL
                </button>

            </nav>


            <main class="difficulty-selection-page">

                <div class="difficulty-selection-header">

                    <div class="difficulty selection-label">
                        ● CHOISIS TA DIFFICULTÉ
                    </div>


                    <h1>
                        Comment veux-tu <span>jouer ?</span>
                    </h1>


                    <p>
                        Choisis ton niveau. Les énigmes et le temps changent selon la difficulté.
                    </p>

                </div>


                <div class="difficulty-grid">


                    <button
                        id="easyButton"
                        class="difficulty-card difficulty-easy"
                    >

                        <div class="difficulty-card-top">

                            <div class="difficulty-icon">
                                🟢
                            </div>

                            <span class="difficulty-number">
                                01
                            </span>

                        </div>


                        <div class="difficulty-card-content">

                            <div class="difficulty-card-label">
                                DÉBUTANT
                            </div>

                            <h2>
                                FACILE
                            </h2>

                            <p>
                                Des énigmes simples pour commencer et réfléchir tranquillement.
                            </p>

                        </div>


                        <div class="difficulty-card-bottom">

                            <span>
                                ∞ TEMPS ILLIMITÉ
                            </span>

                            <strong>
                                →
                            </strong>

                        </div>

                    </button>



                    <button
                        id="mediumButton"
                        class="difficulty-card difficulty-medium"
                    >

                        <div class="difficulty-card-top">

                            <div class="difficulty-icon">
                                🟠
                            </div>

                            <span class="difficulty-number">
                                02
                            </span>

                        </div>


                        <div class="difficulty-card-content">

                            <div class="difficulty-card-label">
                                INTERMÉDIAIRE
                            </div>

                            <h2>
                                MOYEN
                            </h2>

                            <p>
                                Des énigmes plus piégeuses qui demandent un peu de logique.
                            </p>

                        </div>


                        <div class="difficulty-card-bottom">

                            <span>
                                ◷ 1 MINUTE / ÉNIGME
                            </span>

                            <strong>
                                →
                            </strong>

                        </div>

                    </button>



                    <button
                        id="hardButton"
                        class="difficulty-card difficulty-hard"
                    >

                        <div class="difficulty-card-top">

                            <div class="difficulty-icon">
                                🔴
                            </div>

                            <span class="difficulty-number">
                                03
                            </span>

                        </div>


                        <div class="difficulty-card-content">

                            <div class="difficulty-card-label">
                                EXPERT
                            </div>

                            <h2>
                                DIFFICILE
                            </h2>

                            <p>
                                Des énigmes de logique qui demandent beaucoup de réflexion.
                            </p>

                        </div>


                        <div class="difficulty-card-bottom">

                            <span>
                                ⚡ 30 SEC. / ÉNIGME
                            </span>

                            <strong>
                                →
                            </strong>

                        </div>

                    </button>


                </div>

            </main>

        </div>

    `;


    document
        .querySelector("#difficultyLogo")
        .addEventListener(
            "click",
            () => location.reload()
        );


    document
        .querySelector("#difficultyBack")
        .addEventListener(
            "click",
            () => location.reload()
        );


    document
        .querySelector("#easyButton")
        .addEventListener(
            "click",
            () => {

                selectedDifficulty =
                    "easy";

                startGame();

            }
        );


    document
        .querySelector("#mediumButton")
        .addEventListener(
            "click",
            () => {

                selectedDifficulty =
                    "medium";

                startGame();

            }
        );


    document
        .querySelector("#hardButton")
        .addEventListener(
            "click",
            () => {

                selectedDifficulty =
                    "hard";

                startGame();

            }
        );

}


/* =========================================================
   DÉBUT DU JEU
========================================================= */

function startGame() {

    if (
        localStorage.getItem(
            "dailyMysteryCompleted"
        ) === "true"
    ) {

        showEndScreen();

        return;

    }


    currentRiddle = 0;

    mistakes = 0;

    score = 0;


    showRiddle();

}


/* =========================================================
   AFFICHER UNE ÉNIGME
========================================================= */

function showRiddle() {

    clearInterval(timerInterval);


    const riddles =
        riddleSets[selectedDifficulty];


    const riddle =
        riddles[currentRiddle];


    const difficulty =
        difficulties[selectedDifficulty];


    app.innerHTML = `

        <div class="game-page">

            <nav class="navbar">

                <div
                    class="logo"
                    id="gameLogo"
                >
                    DAILY<span>MYSTERY</span>
                </div>


                <button
                    class="back-button"
                    id="backButton"
                >
                    ← ACCUEIL
                </button>

            </nav>


            <main class="game-container">

                <div class="game-top">

                    <div>

                        <small>
                            ${difficulty.name}
                        </small>

                        <h1>
                            #${String(
                                currentRiddle + 1
                            ).padStart(3, "0")}
                        </h1>

                    </div>


                    <div class="game-date">
                        ${currentRiddle + 1} / ${riddles.length}
                    </div>

                </div>


                <div class="game-card">


                    <div class="difficulty">
                        ● ${difficulty.label}
                    </div>


                    <div
                        class="timer"
                        id="timer"
                    >
                        ${
                            difficulty.time === null
                                ? "∞"
                                : `00:${String(
                                    difficulty.time
                                ).padStart(2, "0")}`
                        }
                    </div>


                    <div
                        class="mistakes"
                        id="mistakes"
                    >
                        FAUTES : 0 / 3
                    </div>


                    <h2>
                        ${riddle.question}
                    </h2>


                    <p
                        class="question-help"
                        id="questionHelp"
                    >
                        ${
                            riddle.type === "truefalse"
                                ? "Choisis la bonne réponse."
                                : "Quelle est la réponse ?"
                        }
                    </p>


                    <div
                        id="answerArea"
                        style="width: 100%;"
                    >

                        ${
                            riddle.type === "truefalse"

                                ? `

                                    <div
                                        style="
                                            display:flex;
                                            gap:16px;
                                            width:100%;
                                            margin:20px 0;
                                        "
                                    >

                                        <button
                                            id="trueButton"
                                            style="
                                                flex:1;
                                                min-height:75px;
                                                border:1px solid rgba(255,255,255,0.12);
                                                border-radius:14px;
                                                background:rgba(70,200,120,0.12);
                                                color:#ffffff;
                                                font-size:20px;
                                                font-weight:800;
                                                cursor:pointer;
                                                transition:0.2s ease;
                                            "
                                        >
                                            ✓ VRAI
                                        </button>


                                        <button
                                            id="falseButton"
                                            style="
                                                flex:1;
                                                min-height:75px;
                                                border:1px solid rgba(255,255,255,0.12);
                                                border-radius:14px;
                                                background:rgba(230,70,90,0.12);
                                                color:#ffffff;
                                                font-size:20px;
                                                font-weight:800;
                                                cursor:pointer;
                                                transition:0.2s ease;
                                            "
                                        >
                                            ✕ FAUX
                                        </button>

                                    </div>

                                `

                                : `

                                    <input
                                        id="answer"
                                        type="text"
                                        placeholder="Écris ta réponse..."
                                        autocomplete="off"
                                    >


                                    <button
                                        id="submit"
                                        class="submit-button"
                                    >
                                        VALIDER
                                    </button>

                                `
                        }

                    </div>


                    <button
                        id="hint"
                        class="hint-button"
                    >
                        💡 OBTENIR UN INDICE
                    </button>


                    <p id="hintText"></p>


                    <p id="result"></p>


                    <button
                        id="nextButton"
                        class="submit-button"
                        style="display:none;"
                    >
                        ÉNIGME SUIVANTE →
                    </button>


                </div>

            </main>

        </div>

    `;


    const gameLogo =
        document.querySelector("#gameLogo");


    const backButton =
        document.querySelector("#backButton");


    const answer =
        document.querySelector("#answer");


    const submit =
        document.querySelector("#submit");


    const trueButton =
        document.querySelector("#trueButton");


    const falseButton =
        document.querySelector("#falseButton");


    const hint =
        document.querySelector("#hint");


    const hintText =
        document.querySelector("#hintText");


    const result =
        document.querySelector("#result");


    const timer =
        document.querySelector("#timer");


    const mistakesText =
        document.querySelector("#mistakes");


    const questionHelp =
        document.querySelector("#questionHelp");


    const nextButton =
        document.querySelector("#nextButton");


    gameLogo.addEventListener(
        "click",
        () => location.reload()
    );


    backButton.addEventListener(
        "click",
        () => location.reload()
    );


    /* =====================================================
       TIMER
    ===================================================== */

    if (difficulty.time !== null) {

        timeLeft =
            difficulty.time;


        timerInterval =
            setInterval(
                () => {

                    timeLeft--;


                    timer.textContent =
                        `00:${String(
                            timeLeft
                        ).padStart(2, "0")}`;


                    if (timeLeft <= 0) {

                        clearInterval(
                            timerInterval
                        );


                        endQuestion(
                            "⏰ TEMPS ÉCOULÉ",
                            riddle.correctAnswer
                        );

                    }

                },
                1000
            );

    }


    /* =====================================================
       BONNE RÉPONSE
    ===================================================== */

    function correctAnswer() {

        clearInterval(
            timerInterval
        );


        const pointsEarned =
            getPoints(
                selectedDifficulty,
                mistakes
            );


        score += pointsEarned;


        if (answer) {

            answer.style.display =
                "none";

        }


        if (submit) {

            submit.style.display =
                "none";

        }


        if (trueButton) {

            trueButton.style.display =
                "none";

        }


        if (falseButton) {

            falseButton.style.display =
                "none";

        }


        hint.style.display =
            "none";


        questionHelp.style.display =
            "none";


        hintText.textContent =
            "";


        result.innerHTML =
            `🎉 CORRECT ! <strong>+${pointsEarned} POINTS</strong>`;


        result.className =
            "correct";


        showNextButton();

    }


    /* =====================================================
       MAUVAISE RÉPONSE
    ===================================================== */

    function wrongAnswer() {

        mistakes++;


        mistakesText.textContent =
            `FAUTES : ${mistakes} / 3`;


        if (answer) {

            answer.value = "";

        }


        if (mistakes >= 3) {

            clearInterval(
                timerInterval
            );


            endQuestion(
                "❌ 3 FAUTES",
                riddle.correctAnswer
            );


            return;

        }


        result.textContent =
            "❌ Mauvaise réponse";


        result.className =
            "wrong";

    }


    /* =====================================================
       VALIDATION
    ===================================================== */

    function validateValue(value) {

        if (value === "") {

            result.textContent =
                "Écris une réponse.";


            result.className =
                "wrong";


            return;

        }


        if (
            isCorrectAnswer(
                value,
                riddle.answers
            )
        ) {

            correctAnswer();

            return;

        }


        wrongAnswer();

    }


    /* =====================================================
       VRAI / FAUX
    ===================================================== */

    if (
        riddle.type === "truefalse"
    ) {

        trueButton.addEventListener(
            "click",
            () =>
                validateValue("vrai")
        );


        falseButton.addEventListener(
            "click",
            () =>
                validateValue("faux")
        );


        trueButton.addEventListener(
            "mouseenter",
            () => {

                trueButton.style.transform =
                    "translateY(-3px)";


                trueButton.style.background =
                    "rgba(70,200,120,0.25)";

            }
        );


        trueButton.addEventListener(
            "mouseleave",
            () => {

                trueButton.style.transform =
                    "translateY(0)";


                trueButton.style.background =
                    "rgba(70,200,120,0.12)";

            }
        );


        falseButton.addEventListener(
            "mouseenter",
            () => {

                falseButton.style.transform =
                    "translateY(-3px)";


                falseButton.style.background =
                    "rgba(230,70,90,0.25)";

            }
        );


        falseButton.addEventListener(
            "mouseleave",
            () => {

                falseButton.style.transform =
                    "translateY(0)";


                falseButton.style.background =
                    "rgba(230,70,90,0.12)";

            }
        );

    }


    /* =====================================================
       RÉPONSE ÉCRITE
    ===================================================== */

    if (
        submit &&
        answer
    ) {

        submit.addEventListener(
            "click",
            () =>
                validateValue(
                    answer.value.trim()
                )
        );


        answer.addEventListener(
            "keydown",
            (event) => {

                if (
                    event.key === "Enter"
                ) {

                    submit.click();

                }

            }
        );

    }


    /* =====================================================
       INDICE
    ===================================================== */

    hint.addEventListener(
        "click",
        () => {

            hintText.textContent =
                `💡 ${riddle.hint}`;


            hint.disabled =
                true;


            hint.textContent =
                "INDICE UTILISÉ";

        }
    );


    /* =====================================================
       QUESTION SUIVANTE
    ===================================================== */

    nextButton.addEventListener(
    "click",
    async () => {

            currentRiddle++;


            if (
                currentRiddle >=
                riddles.length
            ) {

                localStorage.setItem(
    "dailyMysteryScore",
    score
);

localStorage.setItem(
    "dailyMysteryCompleted",
    "true"
);

await saveDailyResult(
    score
);

showEndScreen();

            } else {

                mistakes = 0;

                showRiddle();

            }

        }
    );


    function showNextButton() {

        nextButton.style.display =
            "block";

    }


    /* =====================================================
       FIN D'UNE ÉNIGME
    ===================================================== */

    function endQuestion(
        title,
        correctAnswer
    ) {

        clearInterval(
            timerInterval
        );


        if (answer) {

            answer.style.display =
                "none";

        }


        if (submit) {

            submit.style.display =
                "none";

        }


        if (trueButton) {

            trueButton.style.display =
                "none";

        }


        if (falseButton) {

            falseButton.style.display =
                "none";

        }


        hint.style.display =
            "none";


        questionHelp.style.display =
            "none";


        hintText.textContent =
            "";


        result.innerHTML = `

            <strong>
                ${title}
            </strong>

            <br><br>

            La réponse était :
            ${correctAnswer}

        `;


        result.className =
            "wrong";


        nextButton.style.display =
            "block";

    }

}


/* =========================================================
   ÉCRAN FINAL
========================================================= */

function showEndScreen() {

    clearInterval(
        timerInterval
    );


    const finalScore =
        Number(
            localStorage.getItem(
                "dailyMysteryScore"
            )
        ) || score;


    const totalRiddles =
        selectedDifficulty &&
        riddleSets[selectedDifficulty]
            ? riddleSets[
                selectedDifficulty
            ].length
            : 5;


    app.innerHTML = `

        <div class="game-page">

            <nav class="navbar">

                <div
                    class="logo"
                    id="endLogo"
                >
                    DAILY<span>MYSTERY</span>
                </div>

            </nav>


            <main class="game-container">

                <div class="game-card">

                    <div class="difficulty">
                        ● DAILY TERMINÉ
                    </div>


                    <h2>
                        🎉 Bravo !
                    </h2>


                    <p class="question-help">
                        Tu as terminé les ${totalRiddles} énigmes gratuites.
                    </p>


                    <div
                        style="
                            font-size:42px;
                            font-weight:900;
                            margin:30px 0;
                        "
                    >
                        ${finalScore} POINTS
                    </div>


                    <p
                        class="correct"
                        style="
                            font-size:15px;
                            margin-bottom:25px;
                        "
                    >
                        🏆 Ton score du jour
                    </p>


                    <button
                        id="homeButton"
                        class="hint-button"
                    >
                        ← RETOUR À L'ACCUEIL
                    </button>

                </div>

            </main>

        </div>

    `;


    document
        .querySelector("#endLogo")
        .addEventListener(
            "click",
            () => location.reload()
        );


    document
        .querySelector("#homeButton")
        .addEventListener(
            "click",
            () => location.reload()
        );

}
/* =========================================================
   PAGE CLASSEMENT
========================================================= */

async function showRankingPage() {

    clearInterval(
        timerInterval
    );


    app.innerHTML = `

        <div class="site">

            <nav class="navbar">

                <div
                    class="logo"
                    id="rankingLogo"
                >
                    DAILY<span>MYSTERY</span>
                </div>


                <button
                    class="back-button"
                    id="rankingBack"
                >
                    ← ACCUEIL
                </button>

            </nav>


            <main class="ranking-page">

                <div class="ranking-header">

                    <div class="difficulty">
                        ● CLASSEMENT
                    </div>


                    <h1>
                        QUI EST LE <span>MEILLEUR ?</span>
                    </h1>


                    <p>
                        Compare tes performances avec les autres joueurs.
                    </p>

                </div>


                <div class="ranking-grid">

                    <section class="ranking-card">

                        <div class="ranking-card-header">

                            <div>

                                <span class="ranking-icon">
                                    🏆
                                </span>

                                <div>

                                    <small>
                                        CLASSEMENT
                                    </small>

                                    <h2>
                                        POINTS
                                    </h2>

                                </div>

                            </div>

                        </div>


                        <div
                            id="pointsRanking"
                            class="ranking-list"
                        >

                            <div class="ranking-loading">
                                Chargement...
                            </div>

                        </div>

                    </section>


                    <section class="ranking-card">

                        <div class="ranking-card-header">

                            <div>

                                <span class="ranking-icon">
                                    🔥
                                </span>

                                <div>

                                    <small>
                                        CLASSEMENT
                                    </small>

                                    <h2>
                                        WIN STREAK
                                    </h2>

                                </div>

                            </div>

                        </div>


                        <div
                            id="streakRanking"
                            class="ranking-list"
                        >

                            <div class="ranking-loading">
                                Chargement...
                            </div>

                        </div>

                    </section>

                </div>

            </main>

        </div>

    `;


    document
        .querySelector("#rankingLogo")
        .addEventListener(
            "click",
            () => location.reload()
        );


    document
        .querySelector("#rankingBack")
        .addEventListener(
            "click",
            () => location.reload()
        );


    const pointsRanking =
        await getPointsRanking();


    const streakRanking =
        await getWinStreakRanking();


    renderRanking(
        "#pointsRanking",
        pointsRanking,
        "points"
    );


    renderRanking(
        "#streakRanking",
        streakRanking,
        "streak"
    );

}


/* =========================================================
   AFFICHER UN CLASSEMENT
========================================================= */

function renderRanking(
    selector,
    ranking,
    type
) {

    const container =
        document.querySelector(
            selector
        );


    if (
        !ranking ||
        ranking.length === 0
    ) {

        container.innerHTML = `

            <div class="ranking-empty">

                <strong>
                    Aucun joueur pour le moment
                </strong>

                <p>
                    Termine ton Daily pour apparaître ici.
                </p>

            </div>

        `;

        return;

    }


    const currentUser =
        auth.currentUser;


    const currentUserId =
        currentUser
            ? currentUser.uid
            : null;


    container.innerHTML =
        ranking.map(
            (player, index) => {

                const position =
                    index + 1;


                const isCurrentUser =
                    player.uid ===
                    currentUserId;


                const avatar =
                    player.avatar ||
                    "🕵️";


                const pseudo =
                    player.pseudo ||
                    "Joueur";


                const value =
                    type === "points"
                        ? `${Number(
                            player.totalPoints || 0
                        ).toLocaleString(
                            "fr-FR"
                        )} pts`
                        : `${Number(
                            player.winStreak || 0
                        )} jour${
                            Number(
                                player.winStreak || 0
                            ) > 1
                                ? "s"
                                : ""
                        }`;


                return `

                    <div
                        class="
                            ranking-player
                            ${
                                isCurrentUser
                                    ? "ranking-current-user"
                                    : ""
                            }
                        "
                    >

                        <div class="ranking-position">
                            ${
                                position === 1
                                    ? "🥇"
                                    : position === 2
                                        ? "🥈"
                                        : position === 3
                                            ? "🥉"
                                            : position
                            }
                        </div>


                        <div class="ranking-avatar">
                            ${avatar}
                        </div>


                        <div class="ranking-player-info">

                            <strong>
                                ${escapeHtml(
                                    pseudo
                                )}
                            </strong>

                            ${
                                isCurrentUser
                                    ? `
                                        <small>
                                            TOI
                                        </small>
                                    `
                                    : ""
                            }

                        </div>


                        <div class="ranking-value">

                            ${value}

                        </div>

                    </div>

                `;

            }
        ).join("");


    if (currentUserId) {

        const playerRank =
            getPlayerRank(
                ranking,
                currentUserId
            );


        if (playerRank === null) {

            return;

        }

    }

}


/* =========================================================
   PROTECTION DU PSEUDO
========================================================= */

function escapeHtml(
    value
) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}

/* =========================================================
   BOUTONS ACCUEIL
========================================================= */

playButton.addEventListener(
    "click",
    showDifficultySelection
);


previewPlay.addEventListener(
    "click",
    showDifficultySelection
);


navPlay.addEventListener(
    "click",
    showDifficultySelection
);
navRanking.addEventListener(
    "click",
    showRankingPage
);

/* =========================================================
   BOUTON CONNEXION
========================================================= */

loginButton.addEventListener(
    "click",
    () => {

        if (auth.currentUser) {

            showAccountPage(app);

        } else {

            showLoginPage();

        }

    }
);


/* =========================================================
   ÉTAT DE CONNEXION FIREBASE
========================================================= */

onAuthStateChanged(
    auth,
    (user) => {

        const button =
            document.querySelector(
                "#loginButton"
            );


        if (!button) {

            return;

        }


        if (user) {

            button.textContent =
                "MON COMPTE";


            button.onclick =
                () => showAccountPage(app);

        } else {

            button.textContent =
                "SE CONNECTER";


            button.onclick =
                showLoginPage;

        }

    }
);


/* =========================================================
   DAILY DÉJÀ TERMINÉ
========================================================= */

if (dailyCompleted) {

    playButton.innerHTML =
        `DAILY TERMINÉ ✓`;


    previewPlay.textContent =
        "DAILY TERMINÉ ✓";


    navPlay.textContent =
        "TERMINÉ ✓";

}
/* =========================================================
   MESSAGE DE MODIFICATION DU SITE
========================================================= */

function showMaintenanceNotice() {
    if (localStorage.getItem("dailyMysteryNoticeSeen") === "true") {
        return;
    }

    const notice = document.createElement("div");

    notice.innerHTML = `
        <div id="maintenanceNotice" style="
            position: fixed;
            inset: 0;
            background: rgba(5, 6, 10, 0.82);
            backdrop-filter: blur(8px);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            z-index: 99999;
        ">

            <div style="
                width: 100%;
                max-width: 520px;
                background: #11131b;
                border: 1px solid rgba(140,124,255,0.35);
                border-radius: 20px;
                padding: 35px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.5);
                text-align: center;
            ">

                <div style="
                    font-size: 42px;
                    margin-bottom: 15px;
                ">
                    🛠️
                </div>

                <h2 style="
                    margin: 0 0 15px;
                    color: white;
                    font-size: 25px;
                    font-weight: 800;
                ">
                    DAILY MYSTERY EST ENCORE EN MODIFICATION
                </h2>

                <p style="
                    margin: 0 0 12px;
                    color: rgba(255,255,255,0.75);
                    font-size: 15px;
                    line-height: 1.6;
                ">
                    Le site est actuellement en développement.
                    Certains éléments peuvent donc ne pas fonctionner
                    correctement.
                </p>

                <p style="
                    margin: 0 0 25px;
                    color: rgba(255,255,255,0.75);
                    font-size: 15px;
                    line-height: 1.6;
                ">
                    Si tu rencontres un bug, merci de nous le signaler
                    si possible. Merci pour ton aide ! ❤️
                </p>

                <button id="closeMaintenanceNotice" style="
                    width: 100%;
                    padding: 14px;
                    border: none;
                    border-radius: 12px;
                    background: #8c7cff;
                    color: white;
                    font-size: 15px;
                    font-weight: 800;
                    cursor: pointer;
                ">
                    J'AI COMPRIS
                </button>

            </div>
        </div>
    `;

    document.body.appendChild(notice);

    document
        .querySelector("#closeMaintenanceNotice")
        .addEventListener("click", () => {
            localStorage.setItem(
                "dailyMysteryNoticeSeen",
                "true"
            );

            notice.remove();
        });
}

showMaintenanceNotice();
/* =========================================================
   PAGE PREMIUM
========================================================= */

function showPremiumPage() {
    app.innerHTML = `
        <div style="
            min-height: 100vh;
            background: #090a0f;
            color: white;
            padding: 40px 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
        ">

            <div style="
                width: 100%;
                max-width: 1000px;
            ">

                <button id="premiumBack" style="
                    background: transparent;
                    border: none;
                    color: rgba(255,255,255,0.65);
                    font-size: 15px;
                    cursor: pointer;
                    margin-bottom: 50px;
                ">
                    ← Retour
                </button>

                <div style="
                    text-align: center;
                    margin-bottom: 50px;
                ">

                    <div style="
                        font-size: 55px;
                        margin-bottom: 15px;
                    ">
                        💎
                    </div>

                    <h1 style="
                        font-size: 42px;
                        margin: 0 0 15px;
                        font-weight: 900;
                    ">
                        DAILY<span style="color:#8c7cff;">MYSTERY</span> PREMIUM
                    </h1>

                    <p style="
                        color: rgba(255,255,255,0.65);
                        font-size: 17px;
                        margin: 0;
                    ">
                        Une nouvelle façon de jouer à Daily Mystery.
                    </p>

                </div>

                <div style="
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
                    gap: 20px;
                    margin-bottom: 45px;
                ">

                    <div style="
                        background:#11131b;
                        border:1px solid rgba(140,124,255,0.25);
                        border-radius:20px;
                        padding:28px;
                    ">
                        <div style="font-size:32px;">♾️</div>
                        <h3>Plus de parties</h3>
                        <p style="color:rgba(255,255,255,0.6);">
                            Profite de nouvelles possibilités de jeu.
                        </p>
                    </div>

                    <div style="
                        background:#11131b;
                        border:1px solid rgba(140,124,255,0.25);
                        border-radius:20px;
                        padding:28px;
                    ">
                        <div style="font-size:32px;">⚡</div>
                        <h3>Fonctionnalités exclusives</h3>
                        <p style="color:rgba(255,255,255,0.6);">
                            Découvre des fonctionnalités réservées aux membres Premium.
                        </p>
                    </div>

                    <div style="
                        background:#11131b;
                        border:1px solid rgba(140,124,255,0.25);
                        border-radius:20px;
                        padding:28px;
                    ">
                        <div style="font-size:32px;">🏆</div>
                        <h3>Plus de contenu</h3>
                        <p style="color:rgba(255,255,255,0.6);">
                            De nouvelles expériences arriveront progressivement.
                        </p>
                    </div>

                </div>

                <div style="
                    background:linear-gradient(
                        135deg,
                        rgba(140,124,255,0.18),
                        rgba(140,124,255,0.05)
                    );
                    border:1px solid rgba(140,124,255,0.35);
                    border-radius:22px;
                    padding:35px;
                    text-align:center;
                ">

                    <div style="
                        font-size:35px;
                        margin-bottom:10px;
                    ">
                        🚧
                    </div>

                    <h2 style="
                        margin:0 0 10px;
                    ">
                        Premium arrive bientôt
                    </h2>

                    <p style="
                        margin:0;
                        color:rgba(255,255,255,0.65);
                        line-height:1.6;
                    ">
                        Le système Premium n'est pas encore disponible.
                        Il sera ajouté prochainement.
                    </p>

                </div>

            </div>
        </div>
    `;

    document
        .getElementById("premiumBack")
        .addEventListener("click", () => {
            location.reload();
        });
}


/* =========================================================
   BOUTON PREMIUM DANS LA NAVBAR
========================================================= */

const premiumButton = document.createElement("button");

premiumButton.innerHTML = "💎 PREMIUM";

premiumButton.style.cssText = `
    background: linear-gradient(135deg, #8c7cff, #6f5cff);
    color: white;
    border: none;
    padding: 10px 16px;
    border-radius: 10px;
    font-weight: 800;
    font-size: 13px;
    cursor: pointer;
    margin-left: 12px;
`;

premiumButton.addEventListener("click", showPremiumPage);


/* Ajout du bouton dans la navbar */

const navbar = document.querySelector("nav");

if (navbar) {
    const classementButton = Array.from(
        navbar.querySelectorAll("button, a")
    ).find(element =>
        element.textContent.trim().toUpperCase().includes("CLASSEMENT")
    );

    if (classementButton) {
        classementButton.insertAdjacentElement(
            "afterend",
            premiumButton
        );
    } else {
        navbar.appendChild(premiumButton);
    }
}
