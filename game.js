document.addEventListener("DOMContentLoaded", function () {
    let isPaused = false;
    let score = 0;
    let timer = 30;
    let level = 1;
    let interval;
    let foodItems = [];
    let worms = [];
    let wormSpeed = 2;
    let foodCountType1 = 6;
    let foodCountType2 = 4;
    let wormSpawnInterval =  Math.random() * 2000 + 1000;
    let wormSpawnTimer;

    const gameArea = document.getElementById("game-area");
    const scoreDisplay = document.getElementById("score");
    const timerDisplay = document.getElementById("timer");
    const levelDisplay = document.getElementById("level");

    // Initialize the game when the page is loaded
    initializeGame();

    function initializeGame() {
        scoreDisplay.innerText = "Score: " + score;
        timerDisplay.innerText = "Time: " + timer;
        levelDisplay.innerText = "Level: " + level;

        // Generate food items and start the timer
        generateFoodItems();
        generateObstacles();
        spawnWorms();
        startTimer();
    }

    function startTimer() {
        interval = setInterval(() => {
            if (timer > 0) {
                timer--;
                timerDisplay.innerText = "Time: " + timer;    
            } else {
                endGame();
            }
        }, 1000);
    }

    function generateFoodItems() {
        // Create random food items, both type1 (blue) and type2 (red)
        foodCountType1 = Math.floor(Math.random() * 6) + 1;
        foodCountType2 = Math.floor(Math.random() * 4) + 1;
        createFood(foodCountType1, "type1");
        createFood(foodCountType2, "type2");
    }

    function createFood(count, type) {
        for (let i = 0; i < count; i++) {
            let food = document.createElement("div");
            food.classList.add("food", type);
            food.style.width = "15px";
            food.style.height = "15px";
            gameArea.appendChild(food);
            console.log("Food created:", food); // Debugging: log food creation

            placeElementRandomly(food, gameArea, [...foodItems, ...worms, ...document.querySelectorAll('.obstacle')]);
            foodItems.push(food);
        }
    }

    function spawnWorms() {
        wormSpawnTimer = setInterval(() => {
            let wormContainer = document.createElement("div");
            wormContainer.classList.add("worm-container");
            wormContainer.style.width = "20px"; // Larger width for clickable area
            wormContainer.style.height = "20px"; // Larger height for clickable area
            
            let worm = document.createElement("div");
            worm.classList.add("worm");
            worm.style.width = "5px"; // Original size of the worm
            worm.style.height = "15px"; // Original size of the worm
            worm.style.backgroundColor = "black"; // Color of the worm
            worm.style.position = "absolute"; // Make worm position absolute
            worm.style.left = "35%";
            worm.style.top = "15%";

            placeElementRandomly(wormContainer, gameArea, [...foodItems, ...worms, ...document.querySelectorAll('.obstacle')], "0px");
            
            wormContainer.style.position = "absolute";
            wormContainer.appendChild(worm);
            gameArea.appendChild(wormContainer);

            worms.push(worm);

            // Add click event listener to each worm
            wormContainer.addEventListener("click", function () {
                killWorm(worm, wormContainer);
            });

            moveWorm(worm);
            console.log("WormContainer spawned:", wormContainer); // Debugging: log worm creation
        }, wormSpawnInterval);
    }

    // Function to handle killing a worm
    function killWorm(worm, wormContainer) {
        score += 8; // Increase score by 8 points
        scoreDisplay.innerText = "Score: " + score; // Update score display
        worm.remove(); // Remove the worm from the game
        wormContainer.remove(); // Remove the wormContainer from the game
        worms = worms.filter(w => w !== worm); // Remove the worm from the worms array
    }

    // Function to generate obstacles
    function generateObstacles() {
        let obstacleCount = Math.floor(Math.random() * 4) + 1; // Random count of obstacles between 1 and 4
        for (let i = 0; i < obstacleCount; i++) {
            let obstacle = document.createElement("div");
            obstacle.classList.add("obstacle");
            obstacle.style.width = "50px"; // Width of obstacle
            obstacle.style.height = "10px"; // Height of obstacle
            obstacle.style.backgroundColor = "green"; // Color of the obstacle
            obstacle.style.position = "absolute";
            gameArea.appendChild(obstacle);

            placeElementRandomly(obstacle, gameArea, [...foodItems, ...worms, ...document.querySelectorAll('.obstacle')]);
        }
    }

    function moveWorm(worm) {
        // Move the worm towards the closest food item
        const wormMovement = setInterval(() => {
            let wormContainer = worm.parentNode;
            let closestFood = getClosestFood(wormContainer);
            if (!closestFood) {
                clearInterval(wormMovement);
                return;
            }
    
            let dx = closestFood.offsetLeft - wormContainer.offsetLeft;
            let dy = closestFood.offsetTop - wormContainer.offsetTop;
            let dist = Math.sqrt(dx * dx + dy * dy);
            
            wormContainer.style.left = (wormContainer.offsetLeft + (dx / dist) * wormSpeed) + "px";
            wormContainer.style.top = (wormContainer.offsetTop + (dy / dist) * wormSpeed) + "px";;
            
            // Check if worm eats the food
            checkWormEating(wormContainer, closestFood, wormMovement);
        }, 50);
        worm.moveInterval = wormMovement; 
    }
    
    function checkWormEating(worm, food, wormMovement) {
        let dx = worm.offsetLeft - food.offsetLeft;
        let dy = worm.offsetTop - food.offsetTop;
        let dist = Math.sqrt(dx * dx + dy * dy);
    
        if (dist < 12) {  // Adjust this threshold based on your game scale
            // Worm eats the food
            food.remove();
            foodItems = foodItems.filter(f => f !== food); // Remove food from list
    
            // Deduct points when worm eats the food
            score -= food.classList.contains("type1") ? 2 : 4;
            scoreDisplay.innerText = "Score: " + score;

            if(foodItems.length === 0)
                endGame();
        }
    }
    
    function getClosestFood(worm) {
        // Find the closest food item for the worm to target
        let closest = null;
        let minDist = Infinity;
        foodItems.forEach(food => {
            let dx = food.offsetLeft - worm.offsetLeft;
            let dy = food.offsetTop - worm.offsetTop;
            let dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < minDist) {
                minDist = dist;
                closest = food;
            }
        });
        return closest;
    }
    

    function endGame() {
        clearInterval(interval);
        alert("Game Over! Your score: " + score);
        
        // Optionally save the score to localStorage
        let highscore1 = localStorage.getItem("highscore1") || 0;
        let highscore2 = localStorage.getItem("highscore2") || 0;
        
        if (score > highscore1) {
            localStorage.setItem("highscore1", score);
        } else if (score > highscore2) {
            localStorage.setItem("highscore2", score);
        }

        window.location.href = "index.html"; // Redirect to start page
    }

    function increaseDifficulty() {
        // Increase worm spawn rate by reducing the interval between spawns
        wormSpawnInterval = Math.max(500, wormSpawnInterval - 200);
    
        // Increase the number of food items to spawn each level to make it harder
        foodCountType1 += 1;
        foodCountType2 += 1;
    
        // Increase worm movement speed slightly
        wormSpeed += 0.5;
    
        // Clear and reset the existing worm spawn interval with the updated, faster rate
        clearInterval(wormSpawnTimer);
        wormSpawnTimer = setInterval(spawnWorms, wormSpawnInterval);
    
        // Update the new game difficulty in logs for debugging
        console.log("Difficulty increased: Worm Spawn Interval =", wormSpawnInterval, "Worm Speed =", wormSpeed, "Food Counts:", foodCountType1, foodCountType2);
    }

    function togglePause() {
        if (isPaused) {
            // Resume the game
            startTimer(); // Restart the timer
            spawnWorms();
            worms.forEach(worm => moveWorm(worm)); // Resume moving worms
        } else {
            // Pause the game
            clearInterval(interval); // Stop the timer
            clearInterval(wormSpawnTimer);
            // You may also want to stop the movement of worms if needed
            worms.forEach(worm => {
                clearInterval(worm.moveInterval); // Clear the move interval for each worm
            });
        }
        isPaused = !isPaused; // Toggle the pause state
    }

    function isOverlapping(element1, element2, minDistance = 20) {
        const rect1 = element1.getBoundingClientRect();
        const rect2 = element2.getBoundingClientRect();
    
        const dx = rect1.left - rect2.left;
        const dy = rect1.top - rect2.top;
        const distance = Math.sqrt(dx * dx + dy * dy);
    
        return distance < minDistance;
    }
    
    function placeElementRandomly(element, container, existingElements, top = null) {
        let positionValid = false;
        let attempts = 0;
    
        while (!positionValid && attempts < 100) { // Limit to avoid infinite loops
            element.style.left = Math.random() * (container.offsetWidth - element.offsetWidth) + "px";
            // Set the top position randomly or with provided value
            element.style.top = top !== null ? top : Math.random() * (container.offsetHeight - element.offsetHeight) + "px";

            positionValid = true;
            for (let existing of existingElements) {
                if (isOverlapping(element, existing)) {
                    positionValid = false;
                    break;
                }
            }
            attempts++;
        }
    }
    
    document.getElementById("pause-btn").addEventListener("click", togglePause);
});
