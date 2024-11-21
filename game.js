document.addEventListener("DOMContentLoaded", function () {
    let isPaused = false;
    let score = 0;
    let timer = 20;
    const secondLevelTime = 20;
    let level = 1;
    let interval;
    let foodItems = [];
    let worms = [];
    let obstacles = [];
    let foodCountType1 = 6;
    let foodCountType2 = 4;
    let wormSpawnInterval =  Math.random() * 2000 + 1000;
    let wormSpawnTimer;

    const gameArea = document.getElementById("game-area");
    const scoreDisplay = document.getElementById("score");
    const timerDisplay = document.getElementById("timer");
    const levelDisplay = document.getElementById("level");
    const pauseButton = document.getElementById("pause-btn");

    // Worm data structure for each type with corresponding properties
    const wormTypes = [
        {
            color: "black",
            speedLevel1: 2, // Speed at level 1 in pixels per second
            speedLevel2: 3, // Speed at level 2 in pixels per second
            points: 10,
            spawnChance: 30 // Percentage chance of spawning
        },
        {
            color: "red",
            speedLevel1: 1,
            speedLevel2: 1.5,
            points: 5,
            spawnChance: 30
        },
        {
            color: "orange",
            speedLevel1: 1,
            speedLevel2: 1.5,
            points: 3,
            spawnChance: 40
        }
    ];

    // Initialize the game when the page is loaded
    initializeGame();

    function initializeGame() {
        scoreDisplay.innerText = "Score: " + score;
        timerDisplay.innerText = "Time: " + timer;
        levelDisplay.innerText = "Level: " + level;

        if(localStorage.getItem("selectedLevel") == 2) {
            nextLevel();
            // Generate food items and start the timer
            generateFoodItems();
            generateObstacles();
        }
        else{
            // Generate food items and start the timer
            generateFoodItems();
            generateObstacles();
            spawnWorms();
            startTimer();
        }
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

            placeElementRandomly(food, gameArea, [...foodItems, ...obstacles]);
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

            // Select a worm type based on their spawn chances
            const spawnRoll = Math.random() * 100;
            let cumulativeChance = 0;
            let selectedWormType;

            for (const wormType of wormTypes) {
                cumulativeChance += wormType.spawnChance;
                if (spawnRoll < cumulativeChance) {
                    selectedWormType = wormType;
                    break;
                }
            }
            worm.className = `worm ${selectedWormType.color}`;
            
            worm.style.backgroundColor = selectedWormType.color;
            // Set speed based on game level
            worm.dataset.speed = level === 1 ? selectedWormType.speedLevel1 : selectedWormType.speedLevel2;
            worm.dataset.points = selectedWormType.points;

            placeElementRandomly(wormContainer, gameArea, [...foodItems, ...obstacles], "0px");
            
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
        score += parseInt(worm.dataset.points); // Increase score by 8 points
        scoreDisplay.innerText = "Score: " + score; // Update score display
        worm.parentNode.remove();
        worms = worms.filter(w => w !== worm); // Remove the worm from the worms array
    }

    // Function to generate obstacles
    function generateObstacles() {
        let obstacleCount = Math.floor(Math.random() * 4) + 1; // Random count of obstacles between 1 and 4
        for (let i = 0; i < obstacleCount; i++) {
            let obstacle = document.createElement("div");
            obstacle.classList.add("obstacle");
            obstacle.style.width = "40px"; // Width of obstacle
            obstacle.style.height = "10px"; // Height of obstacle
            obstacle.style.backgroundColor = "green"; // Color of the obstacle
            obstacle.style.position = "absolute";
            gameArea.appendChild(obstacle);

            placeElementRandomly(obstacle, gameArea, [...foodItems, ...obstacles]);
            obstacles.push(obstacle);
        }
    }

    function moveWorm(worm) {
        // Move the worm towards the closest food item
        const wormMovement = setInterval(() => {
            if(isPaused)
                return;

            let wormContainer = worm.parentNode;
            let closestFood = getClosestFood(wormContainer);
            if (!closestFood) {
                clearInterval(wormMovement);
                return;
            }
    
            let dx = closestFood.offsetLeft - wormContainer.offsetLeft;
            let dy = closestFood.offsetTop - wormContainer.offsetTop;
            let dist = Math.sqrt(dx * dx + dy * dy);

            
            // Check if worm is about to collide with an obstacle
            let obstacle = getNearbyObstacle(wormContainer);
            if (obstacle) {
                // If obstacle is near, get the nearest corner of the obstacle
                let nearestCorner = getNearestCorner(wormContainer, obstacle);
                dx = (nearestCorner.left-10) - wormContainer.offsetLeft;
                dy = nearestCorner.top - wormContainer.offsetTop;
                dist = Math.sqrt(dx * dx + dy * dy);
            }
            const wormSpeed = parseInt(worm.dataset.speed, 10);
            wormContainer.style.left = (wormContainer.offsetLeft + (dx / dist) * wormSpeed) + "px";
            wormContainer.style.top = (wormContainer.offsetTop + (dy / dist) * wormSpeed) + "px";;
            
            // Check if worm eats the food
            checkWormEating(wormContainer, closestFood, wormMovement);
        }, 50);
        worm.moveInterval = wormMovement; 
    }

    // Function to get the nearest obstacle to the worm if it's within collision range
    function getNearbyObstacle(worm) {
        for (let obstacle of obstacles) {
            if (isOverlapping(worm, obstacle, 20)) {
                return obstacle;
            }
        }
        return null;
    }

    // Function to get the nearest corner with an offset to avoid getting stuck
    function getNearestCorner(worm, obstacle) {
        const wormRect = worm.parentNode.getBoundingClientRect();
        const obstacleRect = obstacle.getBoundingClientRect();
        const offset = 10;

        // Define corners with an offset from the obstacle
        const corners = [
            {left: obstacleRect.left, top: obstacleRect.top},        // Top-left (offset upwards and to the left)
            {left: obstacleRect.right, top: obstacleRect.top},       // Top-right (offset upwards and to the right)
        ];

        // Find the nearest offset corner
        let nearestCorner = corners[0];
        let minDistance = 500;
        for (let corner of corners) {
            let dx = corner.left - wormRect.left;
            let dy = corner.top - wormRect.top;
            let distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < minDistance) {
                minDistance = distance;
                nearestCorner = corner;
            }
        }
        return nearestCorner;
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
        let highscore1 = localStorage.getItem("highscore1") || 0;
        let highscore2 = localStorage.getItem("highscore2") || 0;
        
        if (score > highscore1 && level === 1) {
            localStorage.setItem("highscore1", score);
        } else if (score > highscore2 && level === 2) {
            localStorage.setItem("highscore2", score);
        }
        if (foodItems.length > 0 && level == 1) {
            nextLevel();
        } else {
            clearInterval(interval);
            clearInterval(wormSpawnTimer);
            
            // Show the final score in the dialog box
            document.getElementById("final-score").innerText = score;
            
            // Display the dialog box
            document.getElementById("end-game-dialog").style.display = "flex";
            
            // Set up the "Restart" button
            document.getElementById("restart-btn").addEventListener("click", function () {
                location.reload(); // Reloads the page to restart the game
            });
            
            // Set up the "Exit" button
            document.getElementById("exit-btn").addEventListener("click", function () {
                window.location.href = "index.html"; // Redirects to the start page or another page
            });
        }
    }
    
    function nextLevel() {
        // Increase the level and difficulty
        level = 2;
        levelDisplay.innerText = "Level: " + level;
        
        // Reset the timer
        timer = secondLevelTime;
        timerDisplay.innerText = "Time: " + timer;
        
        // Clear existing food and worms and obstacles
        foodItems.forEach(food => food.remove());
        foodItems = [];
        obstacles.forEach(obstacle => obstacle.remove());
        obstacles = [];
        worms.forEach(worm => {
            clearInterval(worm.moveInterval);
            worm.parentNode.remove();
        });
        worms = [];
        
        // Increase the game difficulty
        increaseDifficulty();
        // Generate new food items and start timer again
        generateFoodItems();
        generateObstacles();
    }

    function increaseDifficulty() {
        // Increase worm spawn rate by reducing the interval between spawns
        wormSpawnInterval = Math.max(500, wormSpawnInterval - 200);
    
        // Increase the number of food items to spawn each level to make it harder
        foodCountType1 = 7;
        foodCountType2 = 5;
        level = 2;
    
        // Clear and reset the existing worm spawn interval with the updated, faster rate
        clearInterval(wormSpawnTimer);
        wormSpawnTimer = setInterval(spawnWorms, wormSpawnInterval);
    
        // Update the new game difficulty in logs for debugging
        console.log("Difficulty increased: Worm Spawn Interval =", wormSpawnInterval, "Food Counts:", foodCountType1, foodCountType2);
    }

    function togglePause() {
        if (isPaused) {
            // Resume the game
            startTimer(); // Restart the timer
            clearInterval(wormSpawnTimer);
            spawnWorms();
            worms.forEach(worm => moveWorm(worm)); // Resume moving worms

            pauseButton.innerText = "Pause";
        } else {
            // Pause the game
            clearInterval(interval); // Stop the timer
            clearInterval(wormSpawnTimer);
            // You may also want to stop the movement of worms if needed
            worms.forEach(worm => {
                clearInterval(worm.moveInterval); // Clear the move interval for each worm
            });
            pauseButton.innerText = "Play";
        }
        isPaused = !isPaused; // Toggle the pause state
    }

    function isOverlapping(element1, element2, minDistance = 30) {
        const isObstacle = element1.classList.contains("obstacle") || element2.classList.contains("obstacle");
        if(isObstacle)
            minDistance += 20;

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
            // Define a border margin for the elements
            const borderMargin = 20; 
            // Set the left position with border margin
            element.style.left = Math.random() * (container.offsetWidth - element.offsetWidth - 2 * borderMargin) + borderMargin + "px";

            // Set the top position with border margin
            element.style.top = top !== null ? top : Math.random() * (container.offsetHeight - element.offsetHeight - 2 * borderMargin) + borderMargin + "px";

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
    pauseButton.addEventListener("click", togglePause);
})