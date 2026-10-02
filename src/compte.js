import { auth } from "./firebase.js";
import { logout } from "./auth.js";


export function showAccountPage(app) {

    const user = auth.currentUser;

    if (!user) {
        return;
    }

    const pseudo =
        user.displayName || "Joueur";

    const savedScore =
        Number(
            localStorage.getItem(
                "dailyMysteryScore"
            )
        ) || 0;

    const dailyCompleted =
        localStorage.getItem(
            "dailyMysteryCompleted"
        ) === "true";

    const creationDate =
        user.metadata &&
        user.metadata.creationTime
            ? new Date(
                user.metadata.creationTime
            ).toLocaleDateString("fr-FR")
            : "—";

    const firstLetter =
        pseudo.charAt(0).toUpperCase();


    app.innerHTML = `

        <div class="site">

            <nav class="navbar">

                <div
                    class="logo"
                    id="accountLogo"
                >
                    DAILY<span>MYSTERY</span>
                </div>

                <button
                    class="back-button"
                    id="accountBack"
                >
                    ← ACCUEIL
                </button>

            </nav>


            <main class="auth-page">

                <div class="auth-container">

                    <div class="auth-card account-card">

                        <div class="auth-label">
                            MON ESPACE
                        </div>


                        <div class="account-avatar">
                            ${firstLetter}
                        </div>


                        <h1>
                            <span>${pseudo}</span>
                        </h1>


                        <p class="auth-description">
                            Ton profil Daily Mystery
                        </p>


                        <div class="account-info">

                            <div class="account-info-item">

                                <small>
                                    PSEUDO
                                </small>

                                <strong>
                                    ${pseudo}
                                </strong>

                            </div>


                            <div class="account-info-item">

                                <small>
                                    E-MAIL
                                </small>

                                <strong>
                                    ${user.email || "—"}
                                </strong>

                            </div>


                            <div class="account-info-item">

                                <small>
                                    STATUT
                                </small>

                                <strong>
                                    🟢 COMPTE ACTIF
                                </strong>

                            </div>


                            <div class="account-info-item">

                                <small>
                                    MEMBRE DEPUIS
                                </small>

                                <strong>
                                    ${creationDate}
                                </strong>

                            </div>

                        </div>


                        <div class="account-stats">

                            <div class="account-stat">

                                <strong>
                                    ${savedScore}
                                </strong>

                                <small>
                                    SCORE DU JOUR
                                </small>

                            </div>


                            <div class="account-stat">

                                <strong>
                                    ${dailyCompleted
                                        ? "✓"
                                        : "—"}
                                </strong>

                                <small>
                                    DAILY TERMINÉ
                                </small>

                            </div>


                            <div class="account-stat">

                                <strong>
                                    5
                                </strong>

                                <small>
                                    ÉNIGMES / JOUR
                                </small>

                            </div>

                        </div>


                        <button
                            id="logoutButton"
                            class="auth-button"
                        >
                            SE DÉCONNECTER
                        </button>

                    </div>

                </div>

            </main>

        </div>

    `;


    document
        .querySelector("#accountLogo")
        .addEventListener(
            "click",
            () => location.reload()
        );


    document
        .querySelector("#accountBack")
        .addEventListener(
            "click",
            () => location.reload()
        );


    document
        .querySelector("#logoutButton")
        .addEventListener(
            "click",
            async () => {

                const success =
                    await logout();

                if (success) {
                    location.reload();
                }

            }
        );

}