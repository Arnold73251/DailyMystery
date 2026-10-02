import { logout } from "./auth.js";

import { auth } from "./firebase.js";

export function showAccountPage(app, timerInterval) {

    clearInterval(timerInterval);

    const user = auth.currentUser;


    if (!user) {

        location.reload();

        return;

    }


    const avatar =
        localStorage.getItem(
            "dailyMysteryAvatar"
        ) || "🕵️";


    const username =
        user.displayName ||
        "Joueur";


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


            <main class="account-page">

                <div class="account-container">

                    <div class="account-card">

                        <div class="account-avatar">
                            ${avatar}
                        </div>


                        <div class="auth-label">
                            MON ESPACE
                        </div>


                        <h1>
                            ${username}
                        </h1>


                        <p class="account-email">
                            ${user.email}
                        </p>


                        <div class="account-divider"></div>


                        <div class="account-section">

                            <div class="account-section-title">
                                PROFIL
                            </div>


                            <div class="account-info-row">

                                <span>
                                    Avatar
                                </span>

                                <strong>
                                    ${avatar}
                                </strong>

                            </div>


                            <div class="account-info-row">

                                <span>
                                    Pseudo
                                </span>

                                <strong>
                                    ${username}
                                </strong>

                            </div>

                        </div>


                        <div class="account-divider"></div>


                        <div class="account-section">

                            <div class="account-section-title">
                                STATISTIQUES
                            </div>


                            <div class="account-stats">

                                <div class="account-stat">

                                    <strong>
                                        0
                                    </strong>

                                    <span>
                                        POINTS
                                    </span>

                                </div>


                                <div class="account-stat">

                                    <strong>
                                        0
                                    </strong>

                                    <span>
                                        PARTIES
                                    </span>

                                </div>


                                <div class="account-stat">

                                    <strong>
                                        0%
                                    </strong>

                                    <span>
                                        RÉUSSITE
                                    </span>

                                </div>

                            </div>

                        </div>


                        <button
                            id="logoutButton"
                            class="account-logout-button"
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