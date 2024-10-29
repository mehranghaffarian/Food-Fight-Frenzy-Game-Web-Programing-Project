document.addEventListener("DOMContentLoaded", function () {
    const startButton = document.getElementById("start-btn");

    // Check if the button exists before adding event listener
    if (startButton) {
        startButton.addEventListener("click", function () {
            // Start the game by redirecting to the game page
            window.location.href = "game.html";
        });
    }

    // Optionally, you can initialize or display high scores here
    // For example, load high scores from localStorage or a database
    const highscore1 = localStorage.getItem("highscore1") || 0;
    const highscore2 = localStorage.getItem("highscore2") || 0;
    document.getElementById("highscore1").innerText = highscore1;
    document.getElementById("highscore2").innerText = highscore2;
});
