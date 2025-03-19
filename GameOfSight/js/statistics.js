/**
 * Statistics Class
 * Handles gathering, calculating, and displaying statistics for the simulation
 */
class Statistics {
    /**
     * Constructor for statistics tracker
     */
    constructor() {
        // Initialize all statistics
        this.reset();
        
        // DOM element references for updating the UI
        this.insideCountElement = document.getElementById('inside-count');
        this.outsideCountElement = document.getElementById('outside-count');
        this.avgInsideTimeElement = document.getElementById('avg-inside-time');
        this.avgOutsideTimeElement = document.getElementById('avg-outside-time');
        this.totalEyeContactsElement = document.getElementById('total-eye-contacts');
        this.totalExitsElement = document.getElementById('total-exits');
        this.unchangedLooksElement = document.getElementById('unchanged-looks');
        this.simulationTimeElement = document.getElementById('simulation-time');
    }
    
    /**
     * Reset all statistics
     */
    reset() {
        this.insideCount = 0;
        this.outsideCount = 0;
        this.totalInsideTime = 0;
        this.totalOutsideTime = 0;
        this.totalEyeContacts = 0;
        this.totalExits = 0;
        this.unchangedLooks = 0;
        
        this.startTime = millis();
        this.simulationTime = 0;
        this.isRunning = false;
    }
    
    /**
     * Start tracking simulation time
     */
    startTimer() {
        this.startTime = millis();
        this.isRunning = true;
    }
    
    /**
     * Pause the simulation timer
     */
    pauseTimer() {
        if (this.isRunning) {
            this.simulationTime += (millis() - this.startTime) / 1000;
            this.isRunning = false;
        }
    }
    
    /**
     * Resume the simulation timer
     */
    resumeTimer() {
        if (!this.isRunning) {
            this.startTime = millis();
            this.isRunning = true;
        }
    }
    
    /**
     * Calculate the current simulation time
     * @returns {number} Total simulation time in seconds
     */
    getCurrentTime() {
        let currentTime = this.simulationTime;
        if (this.isRunning) {
            currentTime += (millis() - this.startTime) / 1000;
        }
        return currentTime;
    }
    
    /**
     * Update statistics based on current state of all participants
     * @param {Array} participants - All participants in the simulation
     */
    update(participants) {
        // Count participants inside and outside
        this.insideCount = 0;
        this.outsideCount = 0;
        this.totalInsideTime = 0;
        this.totalOutsideTime = 0;
        this.totalEyeContacts = 0;
        this.totalExits = 0;
        
        // Aggregate data from all participants
        for (let participant of participants) {
            if (participant.isInside) {
                this.insideCount++;
            } else {
                this.outsideCount++;
            }
            
            this.totalInsideTime += participant.totalTimeInside;
            this.totalOutsideTime += participant.totalTimeOutside;
            this.totalEyeContacts += participant.eyeContactCount;
            this.totalExits += participant.exitCount;
        }
        
        // Update the UI
        this.updateUI(participants.length);
    }
    
    /**
     * Update the statistics display in the UI
     * @param {number} totalParticipants - Total number of participants
     */
    updateUI(totalParticipants) {
        if (!this.insideCountElement) return; // Safety check if DOM not ready
        
        // Update count displays
        this.insideCountElement.textContent = this.insideCount;
        this.outsideCountElement.textContent = this.outsideCount;
        
        // Calculate and update average times
        let avgInsideTime = totalParticipants > 0 ? (this.totalInsideTime / totalParticipants / 1000).toFixed(1) : '0';
        let avgOutsideTime = totalParticipants > 0 ? (this.totalOutsideTime / totalParticipants / 1000).toFixed(1) : '0';
        
        this.avgInsideTimeElement.textContent = avgInsideTime + ' s';
        this.avgOutsideTimeElement.textContent = avgOutsideTime + ' s';
        
        // Update additional statistics
        this.totalEyeContactsElement.textContent = this.totalEyeContacts;
        this.totalExitsElement.textContent = this.totalExits;
        this.unchangedLooksElement.textContent = this.unchangedLooks; // This would need additional tracking
        
        // Update simulation time
        let currentTime = this.getCurrentTime().toFixed(1);
        this.simulationTimeElement.textContent = currentTime + ' s';
    }
}
