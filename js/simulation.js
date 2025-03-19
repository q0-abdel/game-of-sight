/**
 * Simulation Class
 * Controls the main simulation logic for the theater exercise
 */
class Simulation {
    /**
     * Constructor for the simulation
     * @param {Object} settings - Initial settings for the simulation
     */
    constructor(settings) {
        this.settings = settings || {
            participantCount: 10,
            squareSize: 400,
            timeoutDuration: 2, // seconds
            simulationSpeed: 0.6, // Reduced speed as requested
            visionAngle: 60, // Reduced angle as requested
            headRotationSpeed: 2
        };
        
        this.participants = [];
        this.isRunning = false;
        this.isPaused = false;
        this.statistics = {
            totalEyeContacts: 0,
            totalExits: 0
        };
        
        // Timestamp tracking for deltaTime calculation
        this.lastUpdateTime = 0;
        this.startTime = 0;
        this.currentTime = 0;
        
        // Force initial movement debug flag
        this.hasInitialUpdate = false;
        
        // Game over state
        this.isGameOver = false;
        
        console.log("Simulation initialized with settings:", this.settings);
    }
    
    /**
     * Initialize the simulation with participants
     */
    initialize() {
        this.participants = [];
        const halfSize = this.settings.squareSize / 2;
        
        // Reset game over state
        this.isGameOver = false;
        
        // Reset the simulation start time
        this.startTime = millis();
        
        // Calculate positions along the perimeter, evenly distributed
        const perimeter = this.settings.squareSize * 4; // Total perimeter length
        const spacing = perimeter / this.settings.participantCount; // Distance between participants
        
        for (let i = 0; i < this.settings.participantCount; i++) {
            // Calculate position along perimeter (0 to perimeter)
            const positionOnPerimeter = i * spacing;
            
            let x, y;
            
            // Convert perimeter position to x,y coordinates on the edge
            if (positionOnPerimeter < this.settings.squareSize) {
                // Top edge (left to right)
                x = positionOnPerimeter - halfSize;
                y = -halfSize - 5; // Place slightly outside the square
            } else if (positionOnPerimeter < this.settings.squareSize * 2) {
                // Right edge (top to bottom)
                x = halfSize + 5; // Slightly outside
                y = (positionOnPerimeter - this.settings.squareSize) - halfSize;
            } else if (positionOnPerimeter < this.settings.squareSize * 3) {
                // Bottom edge (right to left)
                x = halfSize - (positionOnPerimeter - this.settings.squareSize * 2);
                y = halfSize + 5; // Slightly outside
            } else {
                // Left edge (bottom to top)
                x = -halfSize - 5; // Slightly outside
                y = halfSize - (positionOnPerimeter - this.settings.squareSize * 3);
            }
            
            // Create the participant with initial movement enabled
            const participant = new Participant(
                i, x, y, this.settings.squareSize, this.settings
            );
            
            // Set initial state - outside but ready to move in
            participant.isInside = false;
            participant.isExcluded = false;
            
            // For initial movement: set velocity toward center
            const toCenter = createVector(-x, -y);
            toCenter.normalize();
            toCenter.mult(random(1, 2) * this.settings.simulationSpeed); // Random speed toward center
            participant.dx = toCenter.x;
            participant.dy = toCenter.y;
            participant.velocity.set(toCenter.x, toCenter.y);
            
            // Set initial gaze direction towards the center
            participant.bodyDirection = toCenter.heading();
            participant.headDirection = toCenter.heading();
            participant.headRotationTarget = toCenter.heading();
            
            // Reset timing for a clean start
            participant.lastEyeContactTime = millis();
            participant.lastStatusChangeTime = millis();
            
            this.participants.push(participant);
            console.log(`Participant ${i} placed at edge: (${x}, ${y}) with inward velocity (${participant.dx}, ${participant.dy})`);
        }
        
        this.updateStatistics();
        this.hasInitialUpdate = false;
    }
    
    /**
     * Force an initial update to ensure all participants have movement
     */
    doInitialUpdate() {
        if (!this.hasInitialUpdate) {
            console.log("Performing initial update to ensure movement");
            
            // Do a short update to initialize movement
            const currentTime = millis();
            this.lastUpdateTime = currentTime;
            
            // Log initial positions for debugging
            for (let p of this.participants) {
                console.log(`Initial - Participant ${p.id}: pos=(${p.position.x}, ${p.position.y}), vel=(${p.dx}, ${p.dy}), excluded=${p.isExcluded}`);
            }
            
            this.hasInitialUpdate = true;
        }
    }
    
    /**
     * Start the simulation
     */
    start() {
        if (!this.isRunning) {
            this.initialize();
            this.isRunning = true;
            this.startTime = millis();
        }
    }
    
    /**
     * Stop the simulation
     */
    stop() {
        this.isRunning = false;
    }
    
    /**
     * Pause the simulation
     */
    pause() {
        this.isPaused = true;
    }
    
    /**
     * Resume the simulation
     */
    resume() {
        this.isPaused = false;
        this.lastUpdateTime = millis(); // Reset timing to avoid huge deltaTime
    }
    
    /**
     * Update the simulation state
     */
    update() {
        if (!this.isRunning || this.isPaused) return;
        
        // Force initial movement
        this.doInitialUpdate();
        
        // Calculate delta time since last update (in seconds)
        const currentTime = millis();
        const deltaTime = (currentTime - this.lastUpdateTime) / 1000;
        this.lastUpdateTime = currentTime;
        this.currentTime = currentTime;
        
        // Skip invalid deltaTime values (e.g., on first update)
        if (deltaTime <= 0 || deltaTime > 1) return;
        
        // Update all participants
        for (let p of this.participants) {
            // Normal update with exclusion enabled from the start
            p.update(this.participants, this.settings.squareSize, this.settings, deltaTime, false);
        }
        
        // Check if all participants are excluded (game over condition)
        if (this.isRunning && !this.isGameOver) {
            let allExcluded = true;
            for (let p of this.participants) {
                if (!p.isExcluded) {
                    allExcluded = false;
                    break;
                }
            }
            
            if (allExcluded) {
                this.gameOver();
            }
        }
        
        // Update statistics
        this.updateStatistics();
    }
    
    /**
     * Handle game over state
     */
    gameOver() {
        console.log("GAME OVER: All participants are excluded");
        this.isGameOver = true;
        this.pause();
        
        // Create and display the game over message
        this.displayGameOverMessage();
    }
    
    /**
     * Display game over message and restart option
     */
    displayGameOverMessage() {
        // Remove existing message if there is one
        const existingMessage = document.getElementById('gameOverMessage');
        if (existingMessage) {
            document.body.removeChild(existingMessage);
        }
        
        // Create container for the message
        const gameOverDiv = document.createElement('div');
        gameOverDiv.id = 'gameOverMessage';
        gameOverDiv.style.position = 'absolute';
        gameOverDiv.style.top = '50%';
        gameOverDiv.style.left = '50%';
        gameOverDiv.style.transform = 'translate(-50%, -50%)';
        gameOverDiv.style.background = 'rgba(0, 0, 0, 0.85)';
        gameOverDiv.style.color = 'white';
        gameOverDiv.style.padding = '30px';
        gameOverDiv.style.borderRadius = '10px';
        gameOverDiv.style.maxWidth = '80%';
        gameOverDiv.style.textAlign = 'center';
        gameOverDiv.style.fontFamily = 'Arial, sans-serif';
        gameOverDiv.style.zIndex = '1000';
        gameOverDiv.style.boxShadow = '0 0 20px rgba(255, 0, 0, 0.5)';
        
        // Add close button (X)
        const closeButton = document.createElement('div');
        closeButton.textContent = '✕';
        closeButton.style.position = 'absolute';
        closeButton.style.top = '10px';
        closeButton.style.right = '15px';
        closeButton.style.cursor = 'pointer';
        closeButton.style.fontSize = '20px';
        closeButton.style.fontWeight = 'bold';
        closeButton.style.color = '#aaa';
        closeButton.addEventListener('mouseover', () => {
            closeButton.style.color = 'white';
        });
        closeButton.addEventListener('mouseout', () => {
            closeButton.style.color = '#aaa';
        });
        
        // Add event listener to close button
        closeButton.addEventListener('click', () => {
            document.body.removeChild(gameOverDiv);
            this.restart();
        });
        
        // Add message
        const message = document.createElement('p');
        message.textContent = "Vous êtes morts car vous ne vous êtes pas soutenus par le regard. Un groupe, c'est un réseau de regards qui se maintiennent mutuellement en vie. En négligeant les autres, vous vous êtes éteints vous-mêmes.";
        message.style.fontSize = '18px';
        message.style.lineHeight = '1.5';
        message.style.marginBottom = '20px';
        
        // Add restart button
        const restartButton = document.createElement('button');
        restartButton.textContent = 'Recommencer';
        restartButton.style.padding = '10px 20px';
        restartButton.style.fontSize = '16px';
        restartButton.style.background = '#4CAF50';
        restartButton.style.color = 'white';
        restartButton.style.border = 'none';
        restartButton.style.borderRadius = '5px';
        restartButton.style.cursor = 'pointer';
        
        // Add event listener to restart
        restartButton.addEventListener('click', () => {
            document.body.removeChild(gameOverDiv);
            this.restart();
        });
        
        // Assemble and add to DOM
        gameOverDiv.appendChild(closeButton);
        gameOverDiv.appendChild(message);
        gameOverDiv.appendChild(restartButton);
        document.body.appendChild(gameOverDiv);
    }
    
    /**
     * Restart the simulation
     */
    restart() {
        this.isGameOver = false;
        this.isPaused = false;
        this.stop();
        this.start();
    }
    
    /**
     * Update simulation statistics
     */
    updateStatistics() {
        // Reset counters
        this.statistics.totalEyeContacts = 0;
        this.statistics.totalExits = 0;
        
        // Count eye contacts and exits
        for (let p of this.participants) {
            this.statistics.totalEyeContacts += p.eyeContactCount;
            this.statistics.totalExits += p.exitCount;
        }
    }
    
    /**
     * Draw the simulation on the canvas
     */
    draw() {
        const halfSize = this.settings.squareSize / 2;
        
        // Draw the square boundary
        stroke(0);
        strokeWeight(2);
        noFill();
        rectMode(CENTER);
        rect(0, 0, this.settings.squareSize, this.settings.squareSize);
        
        // Draw all participants
        for (let p of this.participants) {
            p.draw(this.settings.squareSize);
        }
    }
}
