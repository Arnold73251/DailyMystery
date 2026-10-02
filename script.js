const answerInput = document.getElementById("answer");
const submitButton = document.getElementById("submit");
const result = document.getElementById("result");

const correctAnswer = "avenir";

submitButton.addEventListener("click", () => {
const answer = answerInput.value.trim().toLowerCase();

```
if (answer === "") {
    result.textContent = "Écris une réponse !";
    return;
}

if (answer === correctAnswer) {
    result.textContent = "🎉 Correct ! Tu as trouvé le mystère.";
} else {
    result.textContent = "❌ Mauvaise réponse. Essaie encore !";
}
```

});

answerInput.addEventListener("keydown", (event) => {
if (event.key === "Enter") {
submitButton.click();
}
});
