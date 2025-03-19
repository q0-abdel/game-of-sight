/**
 * Game of Sight - Simulateur d'Exercice de Théâtre
 * Un exercice traditionnel de théâtre transformé en simulation interactive
 */

// Globals
let simulation;
let canvasSize = 600;

/**
 * p5.js setup function - runs once at the beginning
 */
function setup() {
    // Create the canvas and attach it to the container
    let canvas = createCanvas(canvasSize, canvasSize);
    canvas.parent('simulation-canvas');
    
    // Create the simulation
    simulation = new Simulation();
    
    // Set up UI
    setupUI();
    
    // Set frame rate
    frameRate(60);
    
    console.log("Setup complete - game ready to start");
}

/**
 * p5.js draw function - loops continuously
 */
function draw() {
    background(240);
    
    // Update and draw the simulation
    if (simulation.isRunning) {
        simulation.update();
    }
    
    // Center the coordinate system and draw the simulation
    push();
    translate(canvasSize/2, canvasSize/2);
    simulation.draw();
    pop();
    
    // Draw FPS for debugging
    textAlign(LEFT, TOP);
    fill(0);
    text(`FPS: ${frameRate().toFixed(1)}`, 10, 10);
}

/**
 * Set up the UI controls and event listeners
 */
function setupUI() {
    // Initialize sliders with default values
    document.getElementById('simulation-speed').value = 0.6; // Updated default
    document.getElementById('vision-angle').value = 60; // Updated default
    
    // Initialize parameter display values
    updateParameterDisplays();
    
    // Add event listeners for controls
    
    // Start button
    document.getElementById('start-btn').addEventListener('click', function() {
        simulation.start();
        
        // Update button states
        document.getElementById('start-btn').disabled = true;
        document.getElementById('pause-btn').disabled = false;
        document.getElementById('reset-btn').disabled = false;
        
        console.log("Simulation started via UI");
    });
    
    // Pause button
    document.getElementById('pause-btn').addEventListener('click', function() {
        if (simulation.isPaused) {
            simulation.resume();
            document.getElementById('pause-btn').textContent = 'Pause';
        } else {
            simulation.pause();
            document.getElementById('pause-btn').textContent = 'Reprendre';
        }
    });
    
    // Reset button
    document.getElementById('reset-btn').addEventListener('click', function() {
        simulation.stop();
        
        // Update button states
        document.getElementById('start-btn').disabled = false;
        document.getElementById('pause-btn').disabled = true;
        document.getElementById('pause-btn').textContent = 'Pause';
        document.getElementById('reset-btn').disabled = true;
        
        // Update statistics displays to zero
        updateStatisticsDisplay({
            totalEyeContacts: 0,
            totalExits: 0
        });
    });
    
    // Slider event listeners
    setupParameterSliders();
}

/**
 * Set up event listeners for parameter sliders
 */
function setupParameterSliders() {
    // Participant count slider
    document.getElementById('participant-count').addEventListener('input', function() {
        document.getElementById('participant-count-value').textContent = this.value;
        updateSimulationSettings();
    });
    
    // Square size slider
    document.getElementById('square-size').addEventListener('input', function() {
        document.getElementById('square-size-value').textContent = this.value;
        updateSimulationSettings();
    });
    
    // Timeout duration slider
    document.getElementById('timeout-duration').addEventListener('input', function() {
        document.getElementById('timeout-duration-value').textContent = this.value;
        updateSimulationSettings();
    });
    
    // Simulation speed slider
    document.getElementById('simulation-speed').addEventListener('input', function() {
        document.getElementById('simulation-speed-value').textContent = parseFloat(this.value).toFixed(1);
        updateSimulationSettings();
    });
    
    // Vision angle slider
    document.getElementById('vision-angle').addEventListener('input', function() {
        document.getElementById('vision-angle-value').textContent = this.value;
        updateSimulationSettings();
    });
    
    // Head rotation speed slider
    document.getElementById('head-rotation-speed').addEventListener('input', function() {
        document.getElementById('head-rotation-speed-value').textContent = this.value;
        updateSimulationSettings();
    });
}

/**
 * Update the simulation settings from the UI controls
 */
function updateSimulationSettings() {
    if (!simulation) return;
    
    // Only allow changing settings when simulation is not running
    if (simulation.isRunning) return;
    
    simulation.settings = {
        participantCount: parseInt(document.getElementById('participant-count').value),
        squareSize: parseInt(document.getElementById('square-size').value),
        timeoutDuration: parseFloat(document.getElementById('timeout-duration').value),
        simulationSpeed: parseFloat(document.getElementById('simulation-speed').value),
        visionAngle: parseInt(document.getElementById('vision-angle').value),
        headRotationSpeed: parseFloat(document.getElementById('head-rotation-speed').value)
    };
    
    console.log("Simulation settings updated:", simulation.settings);
}

/**
 * Update the parameter display values
 */
function updateParameterDisplays() {
    document.getElementById('participant-count-value').textContent = 
        document.getElementById('participant-count').value;
    
    document.getElementById('square-size-value').textContent = 
        document.getElementById('square-size').value;
    
    document.getElementById('timeout-duration-value').textContent = 
        document.getElementById('timeout-duration').value;
    
    document.getElementById('simulation-speed-value').textContent = 
        parseFloat(document.getElementById('simulation-speed').value).toFixed(1);
    
    document.getElementById('vision-angle-value').textContent = 
        document.getElementById('vision-angle').value;
    
    document.getElementById('head-rotation-speed-value').textContent = 
        document.getElementById('head-rotation-speed').value;
}

/**
 * Update the statistics display
 * @param {Object} stats - Statistics object from simulation
 */
function updateStatisticsDisplay(stats) {
    document.getElementById('eye-contact-count').textContent = stats.totalEyeContacts || 0;
    document.getElementById('exit-count').textContent = stats.totalExits || 0;
}
