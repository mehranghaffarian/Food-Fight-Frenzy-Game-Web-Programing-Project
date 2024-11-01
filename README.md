# Food Fight Frenzy Game

## Overview
**Food Fight Frenzy** is a single-player web-based game where the player aims to eliminate worms that are trying to eat food. The game is designed using only HTML, CSS, and JavaScript, without relying on any third-party libraries.

## Game Mechanics
- **Game Start:** A new worm spawns every 1 to 3 seconds from the top of the screen, moving towards the nearest food item.
- **Food Types:**
  - **Type 1 (Blue Circles):** Deducts 2 points if eaten by a worm.
  - **Type 2 (Red Circles):** Deducts 4 points if eaten by a worm.
- **Worm Mechanics:** 
  - All worms are black and move at a speed of 80 pixels per second in Level 1.
  - The player scores 8 points for each worm eliminated.
- **Obstacles:** Green square obstacles are randomly placed on the screen, forcing worms to change direction when approached.
- **Game Duration:** Each game lasts 60 seconds. The game ends either when the time runs out or all food is consumed.
- **Level Progression:** After successfully completing Level 1, players progress to Level 2, where worm speed increases to 100 pixels per second.

## Features
- **Two Screens:**
  - **Start Screen:** Displays the highest score and allows the player to start the game.
  - **Game Screen:** Contains the game display, score, timer, and a pause button.
- **Canvas Display:** Worms are represented on the screen using a canvas element or as triangles if canvas implementation is challenging.
- **Pause Functionality:** Players can pause the game, and it resumes when the play button is pressed again.
- **Scoring System:** The score is displayed and updated based on player actions.

## Requirements
- Implemented using HTML, CSS, and JavaScript without third-party libraries.
- Ensure no overlapping of food items and other game elements.
- Responsive design with a recommended size of 400x600 pixels for the game screen.

## Additional Notes
- Players can track their high scores, and upon achieving a new high score, a congratulatory message will be displayed.
- The game will provide a fun and engaging experience while adhering to the specified requirements and mechanics.
