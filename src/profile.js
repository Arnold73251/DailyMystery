import { updateUsername } from "./auth.js";

export function showProfileCreationPage(app, timerInterval) {

    clearInterval(timerInterval);

    const avatars = [
        "🕵️",
        "🦊",
        "🐼",
        "🤖",
        "👽",
        "🐸",
        "🦁",
        "🐨"
    ];

    let selectedAvatar = avatars[0];

    app.innerHTML = `

        <div class="site">

            <nav class="navbar">

                <div
                    class="logo"
                    id="profileLogo"
                >
                    DAILY<span>MYSTERY</span>
                </div>

            </nav>


            <main class="profile-creation-page">

                <div class="profile-creation-card">

                    <div class="auth-label">
                        DAILY MYSTERY
                    </div>


                    <h1>
                        CRÉE TON <span>PROFIL</span>
                    </h1>


                    <p class="auth-description">
                        Choisis ton pseudo et ton avatar.
                    </p>


                    <div
                        class="avatar-preview"
                        id="avatarPreview"
                    >
                        ${selectedAvatar}
                    </div>


                    <label
                        class="profile-label"
                        for="profileUsername"
                    >
                        PSEUDO
                    </label>


                    <input
                        id="profileUsername"
                        class="profile-input"
                        type="text"
                        placeholder="Ton pseudo"
                        minlength="3"
                        maxlength="16"
                        autocomplete="off"
                    >


                    <div class="avatar-grid">

                        ${avatars.map(
                            (avatar, index) => `
                                <button
                                    type="button"
                                    class="avatar-choice ${
                                        index === 0
                                            ? "selected"
                                            : ""
                                    }"
                                    data-avatar="${avatar}"
                                >
                                    ${avatar}
                                </button>
                            `
                        ).join("")}

                    </div>


                    <p
                        id="profileError"
                        class="auth-error"
                    ></p>


                    <p class="profile-info">
                        🏆 Ton pseudo sera visible dans le classement Daily Mystery.
                    </p>


                    <button
                        id="saveProfileButton"
                        class="auth-button"
                    >
                        CONTINUER
                    </button>

                </div>

            </main>

        </div>

    `;


    document
        .querySelector("#profileLogo")
        .addEventListener(
            "click",
            () => location.reload()
        );


    const avatarButtons =
        document.querySelectorAll(
            ".avatar-choice"
        );


    avatarButtons.forEach(
        (button) => {

            button.addEventListener(
                "click",
                () => {

                    avatarButtons.forEach(
                        (item) => {

                            item.classList.remove(
                                "selected"
                            );

                        }
                    );


                    button.classList.add(
                        "selected"
                    );


                    selectedAvatar =
                        button.dataset.avatar;


                    document
                        .querySelector(
                            "#avatarPreview"
                        )
                        .textContent =
                        selectedAvatar;

                }
            );

        }
    );


    document
        .querySelector(
            "#saveProfileButton"
        )
        .addEventListener(
            "click",
            async () => {

                const username =
                    document
                        .querySelector(
                            "#profileUsername"
                        )
                        .value
                        .trim();


                const errorElement =
                    document.querySelector(
                        "#profileError"
                    );


                if (
                    username.length < 3
                ) {

                    errorElement.textContent =
                        "Ton pseudo doit contenir au moins 3 caractères.";

                    return;

                }


                if (
                    username.length > 16
                ) {

                    errorElement.textContent =
                        "Ton pseudo doit contenir maximum 16 caractères.";

                    return;

                }


                errorElement.textContent =
                    "Enregistrement...";


                const result =
                    await updateUsername(
                        username
                    );


                if (!result.success) {

                    errorElement.textContent =
                        result.message;

                    return;

                }


                localStorage.setItem(
                    "dailyMysteryAvatar",
                    selectedAvatar
                );


                location.reload();

            }
        );

}