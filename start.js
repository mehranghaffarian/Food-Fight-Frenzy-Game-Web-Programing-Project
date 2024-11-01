let selectedLevel = 1;
const level1Radio = document.getElementById("level1");
const level2Radio = document.getElementById("level2");
    

document.addEventListener("DOMContentLoaded", function () {
    const startButton = document.getElementById("start-btn");
    
    function updateScore() {
        // For example, load high scores from localStorage or a database
        const highscore1 = localStorage.getItem("highscore1") || 0;
        const highscore2 = localStorage.getItem("highscore2") || 0;
        
        selectedLevel = level1Radio.checked ? 1 : 2;
        document.getElementById("highestScore").innerText = selectedLevel == 2 ? highscore2 : highscore1;
        localStorage.setItem("selectedLevel", selectedLevel);
    }
    level1Radio.addEventListener("change", updateScore);
    level2Radio.addEventListener("change", updateScore);

    // Initialize the displayed score based on the default selected level
    updateScore();

    // Check if the button exists before adding event listener
    startButton.addEventListener("click", function () {
        // Start the game by redirecting to the game page
        window.location.href = "game.html";
    });
});
