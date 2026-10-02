import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    updateProfile
} from "firebase/auth";

import { auth } from "./firebase.js";


// ================================
// CONNEXION
// ================================

export async function login(email, password) {

    try {

        const userCredential =
            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

        return {
            success: true,
            user: userCredential.user
        };

    } catch (error) {

        console.error(
            "Erreur connexion Firebase :",
            error
        );

        let message =
            "Une erreur est survenue.";

        if (
            error.code ===
            "auth/invalid-credential"
        ) {
            message =
                "E-mail ou mot de passe incorrect.";
        }

        if (
            error.code ===
            "auth/user-not-found"
        ) {
            message =
                "Aucun compte ne correspond à cet e-mail.";
        }

        if (
            error.code ===
            "auth/wrong-password"
        ) {
            message =
                "Mot de passe incorrect.";
        }

        if (
            error.code ===
            "auth/invalid-email"
        ) {
            message =
                "Adresse e-mail invalide.";
        }

        if (
            error.code ===
            "auth/too-many-requests"
        ) {
            message =
                "Trop de tentatives. Réessaie plus tard.";
        }

        if (
            error.code ===
            "auth/network-request-failed"
        ) {
            message =
                "Problème de connexion à Internet.";
        }

        return {
            success: false,
            message
        };
    }
}


// ================================
// INSCRIPTION
// ================================

export async function register(
    email,
    password
) {

    try {

        const userCredential =
            await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

        return {
            success: true,
            user: userCredential.user
        };

    } catch (error) {

        console.error(
            "Erreur inscription Firebase :",
            error
        );

        let message =
            "Impossible de créer le compte.";

        if (
            error.code ===
            "auth/email-already-in-use"
        ) {
            message =
                "Un compte existe déjà avec cet e-mail.";
        }

        if (
            error.code ===
            "auth/invalid-email"
        ) {
            message =
                "Adresse e-mail invalide.";
        }

        if (
            error.code ===
            "auth/weak-password"
        ) {
            message =
                "Le mot de passe doit contenir au moins 6 caractères.";
        }

        if (
            error.code ===
            "auth/operation-not-allowed"
        ) {
            message =
                "La création de comptes par e-mail n'est pas activée dans Firebase.";
        }

        if (
            error.code ===
            "auth/network-request-failed"
        ) {
            message =
                "Problème de connexion à Internet.";
        }

        if (
            error.code ===
            "auth/invalid-api-key"
        ) {
            message =
                "La configuration Firebase est incorrecte.";
        }

        return {
            success: false,
            message
        };
    }
}


// ================================
// MODIFIER LE PSEUDO
// ================================

export async function updateUsername(
    pseudo
) {

    try {

        const user = auth.currentUser;

        if (!user) {
            return {
                success: false,
                message: "Aucun compte connecté."
            };
        }

        await updateProfile(
            user,
            {
                displayName: pseudo
            }
        );

        return {
            success: true,
            user
        };

    } catch (error) {

        console.error(
            "Erreur pseudo Firebase :",
            error
        );

        return {
            success: false,
            message:
                "Impossible d'enregistrer ton pseudo."
        };
    }
}


// ================================
// DÉCONNEXION
// ================================

export async function logout() {

    try {

        await signOut(auth);

        return true;

    } catch (error) {

        console.error(
            "Erreur déconnexion :",
            error
        );

        return false;
    }
}