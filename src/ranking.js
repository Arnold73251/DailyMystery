import {
    collection,
    doc,
    getDocs,
    limit,
    orderBy,
    query,
    runTransaction
} from "firebase/firestore";

import {
    auth,
    db
} from "./firebase.js";


/* =========================================================
   DATE DU JOUR
========================================================= */

function getToday() {

    const now = new Date();

    const year =
        now.getFullYear();

    const month =
        String(
            now.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            now.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;

}


function getYesterday() {

    const date =
        new Date();

    date.setDate(
        date.getDate() - 1
    );

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;

}


/* =========================================================
   SAUVEGARDER LE RÉSULTAT DU DAILY
========================================================= */

export async function saveDailyResult(
    score
) {

    const user =
        auth.currentUser;


    if (!user) {

        return {
            success: false,
            message: "Aucun joueur connecté."
        };

    }


    try {

        const userRef =
            doc(
                db,
                "users",
                user.uid
            );


        const today =
            getToday();

        const yesterday =
            getYesterday();


        const avatar =
            localStorage.getItem(
                "dailyMysteryAvatar"
            ) || "🕵️";


        await runTransaction(
            db,
            async (transaction) => {

                const userDoc =
                    await transaction.get(
                        userRef
                    );


                let totalPoints = 0;

                let winStreak = 0;

                let lastCompletedDate = null;


                if (userDoc.exists()) {

                    const data =
                        userDoc.data();


                    totalPoints =
                        Number(
                            data.totalPoints
                        ) || 0;


                    winStreak =
                        Number(
                            data.winStreak
                        ) || 0;


                    lastCompletedDate =
                        data.lastCompletedDate ||
                        null;

                }


                /* -----------------------------------------
                   ÉVITER DE COMPTER DEUX FOIS LE MÊME JOUR
                ----------------------------------------- */

                if (
                    lastCompletedDate ===
                    today
                ) {

                    return;

                }


                /* -----------------------------------------
                   CALCUL DU WIN STREAK
                ----------------------------------------- */

                if (
                    lastCompletedDate ===
                    yesterday
                ) {

                    winStreak++;

                } else {

                    winStreak = 1;

                }


                /* -----------------------------------------
                   AJOUT DES POINTS
                ----------------------------------------- */

                totalPoints +=
                    Number(score) || 0;


                transaction.set(
                    userRef,
                    {

                        uid:
                            user.uid,

                        pseudo:
                            user.displayName ||
                            "Joueur",

                        avatar:

                            avatar,

                        totalPoints:
                            totalPoints,

                        winStreak:
                            winStreak,

                        lastCompletedDate:
                            today

                    },
                    {
                        merge: true
                    }
                );

            }
        );


        return {
            success: true
        };


    } catch (error) {

        console.error(
            "Erreur classement :",
            error
        );


        return {
            success: false,
            message:
                "Impossible d'enregistrer ton score."
        };

    }

}


/* =========================================================
   RÉCUPÉRER LE CLASSEMENT DES POINTS
========================================================= */

export async function getPointsRanking() {

    try {

        const rankingQuery =
            query(
                collection(
                    db,
                    "users"
                ),
                orderBy(
                    "totalPoints",
                    "desc"
                ),
                limit(20)
            );


        const snapshot =
            await getDocs(
                rankingQuery
            );


        return snapshot.docs.map(
            (document) => ({
                id:
                    document.id,
                ...document.data()
            })
        );


    } catch (error) {

        console.error(
            "Erreur classement points :",
            error
        );


        return [];

    }

}


/* =========================================================
   RÉCUPÉRER LE CLASSEMENT WIN STREAK
========================================================= */

export async function getWinStreakRanking() {

    try {

        const rankingQuery =
            query(
                collection(
                    db,
                    "users"
                ),
                orderBy(
                    "winStreak",
                    "desc"
                ),
                limit(20)
            );


        const snapshot =
            await getDocs(
                rankingQuery
            );


        return snapshot.docs.map(
            (document) => ({
                id:
                    document.id,
                ...document.data()
            })
        );


    } catch (error) {

        console.error(
            "Erreur classement win streak :",
            error
        );


        return [];

    }

}


/* =========================================================
   RÉCUPÉRER LE RANG D'UN JOUEUR
========================================================= */

export function getPlayerRank(
    ranking,
    uid
) {

    const index =
        ranking.findIndex(
            (player) =>
                player.uid === uid
        );


    if (index === -1) {

        return null;

    }


    return index + 1;

}