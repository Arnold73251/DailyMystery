/* =========================================================
   DAILY MYSTERY — SYSTÈME DU JOUR
========================================================= */

export function getTodayKey() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


/* =========================================================
   MÉLANGE DES QUESTIONS
========================================================= */

function seededRandom(seed) {
    let value = seed;

    return function () {
        value = (value * 9301 + 49297) % 233280;
        return value / 233280;
    };
}


function createSeed(date, difficulty) {
    let seed = 0;

    const text = `${date}-${difficulty}`;

    for (let i = 0; i < text.length; i++) {
        seed =
            (seed * 31 + text.charCodeAt(i)) %
            2147483647;
    }

    return Math.abs(seed);
}


function shuffleQuestions(questions, date, difficulty) {
    const copy = [...questions];

    const random = seededRandom(
        createSeed(date, difficulty)
    );

    for (
        let i = copy.length - 1;
        i > 0;
        i--
    ) {
        const j = Math.floor(
            random() * (i + 1)
        );

        [copy[i], copy[j]] =
            [copy[j], copy[i]];
    }

    return copy;
}


/* =========================================================
   OBTENIR LES 5 QUESTIONS DU JOUR
========================================================= */

export function getDailyQuestions(
    riddleSets,
    difficulty
) {
    const today = getTodayKey();

    const questions =
        riddleSets[difficulty] || [];

    const shuffled =
        shuffleQuestions(
            questions,
            today,
            difficulty
        );

    return shuffled.slice(0, 5);
}


/* =========================================================
   CLÉ DE COMPLETION
========================================================= */

export function getDailyCompletionKey(
    difficulty
) {
    return `dailyMysteryCompleted_${getTodayKey()}_${difficulty}`;
}


export function isDailyCompleted(
    difficulty
) {
    return (
        localStorage.getItem(
            getDailyCompletionKey(difficulty)
        ) === "true"
    );
}


export function markDailyCompleted(
    difficulty,
    score
) {
    localStorage.setItem(
        getDailyCompletionKey(difficulty),
        "true"
    );

    localStorage.setItem(
        `dailyMysteryScore_${getTodayKey()}_${difficulty}`,
        String(score)
    );
}


export function getDailyScore(
    difficulty
) {
    return (
        Number(
            localStorage.getItem(
                `dailyMysteryScore_${getTodayKey()}_${difficulty}`
            )
        ) || 0
    );
}