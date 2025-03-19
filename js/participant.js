/**
 * Participant Class
 * Represents a single participant in the theater exercise simulation
 */
class Participant {
    /**
     * Constructor for a new participant
     * @param {number} id - Unique identifier for the participant
     * @param {number} x - Initial x position
     * @param {number} y - Initial y position
     * @param {number} squareSize - Size of the square area
     * @param {Object} settings - Simulation settings
     */
    constructor(id, x, y, squareSize, settings) {
        this.id = id;
        this.position = createVector(x, y);
        
        // IMPORTANT: Initialize with non-zero velocity components
        // Create a random velocity with explicitly set x and y components
        this.dx = random(-2, 2) * settings.simulationSpeed;
        this.dy = random(-2, 2) * settings.simulationSpeed;
        this.velocity = createVector(this.dx, this.dy);
        
        // Make sure velocity is never zero in both components
        if (abs(this.dx) < 0.5) this.dx = (this.dx >= 0) ? 0.5 : -0.5;
        if (abs(this.dy) < 0.5) this.dy = (this.dy >= 0) ? 0.5 : -0.5;
        this.velocity.set(this.dx, this.dy);
        
        this.bodyDirection = this.velocity.heading();
        
        // Head can rotate relative to the body, with limits
        this.headDirection = this.bodyDirection;
        this.maxHeadRotation = radians(140); // Maximum head rotation from body direction
        this.headRotationSpeed = settings.headRotationSpeed;
        this.headRotationTarget = this.headDirection;
        
        // Vision properties
        this.visionAngle = radians(settings.visionAngle);
        this.visionDistance = squareSize * 0.8; // Can see most of the square
        
        // Status properties
        this.isInside = true;
        this.isExcluded = false; // New property to track exclusion status
        this.lastEyeContactTime = millis();
        this.hasEyeContact = false;
        this.eyeContactPartnerId = null;
        this.exclusionTimeout = settings.timeoutDuration * 1000;
        
        // Exclusion state tracking
        this.isMovingToEdge = false; // Moving towards the edge when being excluded
        this.edgeTarget = null; // Position on the edge to move towards
        
        // Statistics tracking
        this.totalTimeInside = 0;
        this.totalTimeOutside = 0;
        this.lastStatusChangeTime = millis();
        this.exitCount = 0;
        this.eyeContactCount = 0;
        
        // Random movement properties
        this.changeDirectionProbability = 0.03; // 3% chance per frame
        this.directionChangeIntensity = 1.0;
        this.nextDirectionChange = 0; // Force immediate direction change
        this.directionChangeTimer = 0;
        
        // Appearance
        this.size = 10;
        this.color = color(50, 150, 200);       // Normal color (inside)
        this.excludedColor = color(200, 100, 50); // Excluded color (at edge)
        this.movingToEdgeColor = color(255, 150, 0); // Moving to edge color
        this.eyeContactColor = color(100, 200, 100);
        
        // Ensure all participants start moving
        this.isMoving = true;
        
        console.log(`Participant ${id} created with velocity: (${this.dx}, ${this.dy})`);
    }
    
    /**
     * Simple, direct update function for normal movement
     * @param {number} squareSize - Size of the square area
     * @param {number} deltaTime - Time since last frame in seconds
     */
    updateNormalMovement(squareSize, deltaTime) {
        const halfSize = squareSize / 2;
        
        // Apply velocity
        let newX = this.position.x + this.dx * deltaTime * 60; // Scale by deltaTime for 60fps equivalent
        let newY = this.position.y + this.dy * deltaTime * 60;
        
        // Boundary checks and reflection
        let bounced = false;
        if (newX < -halfSize || newX > halfSize) {
            this.dx = -this.dx;
            bounced = true;
            // Ensure not out of bounds
            if (newX < -halfSize) newX = -halfSize;
            if (newX > halfSize) newX = halfSize;
        }
        
        if (newY < -halfSize || newY > halfSize) {
            this.dy = -this.dy;
            bounced = true;
            // Ensure not out of bounds
            if (newY < -halfSize) newY = -halfSize;
            if (newY > halfSize) newY = halfSize;
        }
        
        // Random changes (1% chance)
        if (random() < 0.01) {
            this.dx = random(-2, 2);
            this.dy = random(-2, 2);
            // Make sure velocity is never zero in both components
            if (abs(this.dx) < 0.5) this.dx = (this.dx >= 0) ? 0.5 : -0.5;
            if (abs(this.dy) < 0.5) this.dy = (this.dy >= 0) ? 0.5 : -0.5;
        }
        
        // Update position
        this.position.x = newX;
        this.position.y = newY;
        
        // Update velocity vector for the rest of the code
        this.velocity.set(this.dx, this.dy);
        
        // Update body and head direction
        if (bounced || random() < 0.01) {
            this.bodyDirection = this.velocity.heading();
            this.headRotationTarget = this.bodyDirection;
        }
        
        // Smoothly rotate head towards target
        let headDiff = this.headRotationTarget - this.headDirection;
        // Ensure we rotate the shorter way around the circle
        if (headDiff > PI) headDiff -= TWO_PI;
        if (headDiff < -PI) headDiff += TWO_PI;
        this.headDirection += headDiff * this.headRotationSpeed * deltaTime;
    }
    
    /**
     * Update movement for when moving to edge (excluded)
     * @param {number} squareSize - Size of the square area
     * @param {number} deltaTime - Time since last frame in seconds
     * @param {Object} settings - Simulation settings
     */
    updateMovingToEdge(squareSize, deltaTime, settings) {
        const halfSize = squareSize / 2;
        
        if (!this.edgeTarget) {
            // Calculate nearest edge point if we don't have one
            this.calculateEdgeTarget(halfSize);
        }
        
        // Move towards the edge
        let toEdge = p5.Vector.sub(this.edgeTarget, this.position);
        let distToEdge = toEdge.mag();
        
        if (distToEdge < 5) {
            // Reached the edge
            console.log(`Participant ${this.id} reached the edge`);
            this.position = this.edgeTarget.copy();
            this.isMovingToEdge = false;
            this.edgeTarget = null;
            
            // Stop movement at the edge
            this.dx = 0;
            this.dy = 0;
            this.velocity.set(0, 0);
            
            // Update statistics
            if (this.isInside) {
                this.isInside = false;
                this.lastStatusChangeTime = millis();
            }
        } else {
            // Still moving to the edge
            toEdge.normalize();
            
            // Set velocity directly towards edge
            this.dx = toEdge.x * settings.simulationSpeed * 1.5;
            this.dy = toEdge.y * settings.simulationSpeed * 1.5;
            this.velocity.set(this.dx, this.dy);
            
            // Update position
            this.position.x += this.dx * deltaTime * 60;
            this.position.y += this.dy * deltaTime * 60;
            
            // Update body direction to face movement direction
            this.bodyDirection = this.velocity.heading();
        }
    }
    
    /**
     * Update movement during the initial period (moving from outside to inside)
     * @param {number} squareSize - Size of the square area
     * @param {number} deltaTime - Time since last frame in seconds
     * @param {Object} settings - Simulation settings
     * @param {Array} participants - All participants in the simulation
     */
    updateInitialMovement(squareSize, deltaTime, settings, participants = []) {
        const halfSize = squareSize / 2;
        
        // Apply velocity - already set toward center during initialization
        let newX = this.position.x + this.dx * deltaTime * 60; // Scale by deltaTime for 60fps equivalent
        let newY = this.position.y + this.dy * deltaTime * 60;
        
        // Check if we're crossing into the square
        const wasOutside = !this.isInside;
        const nowInside = Math.abs(newX) < halfSize && Math.abs(newY) < halfSize;
        
        if (wasOutside && nowInside) {
            // Just entered the square
            this.isInside = true;
            this.lastStatusChangeTime = millis();
            this.lastEyeContactTime = millis(); // Reset eye contact timer when entering
            console.log(`Participant ${this.id} entered the square`);
        }
        
        // Update position
        this.position.x = newX;
        this.position.y = newY;
        
        // Update body direction to face movement direction
        this.bodyDirection = this.velocity.heading();
        
        // Smoothly rotate head towards target (already set to look toward center)
        let headDiff = this.headRotationTarget - this.headDirection;
        // Ensure we rotate the shorter way around the circle
        if (headDiff > PI) headDiff -= TWO_PI;
        if (headDiff < -PI) headDiff += TWO_PI;
        this.headDirection += headDiff * this.headRotationSpeed * deltaTime;
        
        // Handle boundary crossing - if we hit the edge, bounce inward
        if (Math.abs(this.position.x) > halfSize || Math.abs(this.position.y) > halfSize) {
            // If we somehow got outside the boundary, redirect inward
            const toCenter = createVector(-this.position.x, -this.position.y);
            toCenter.normalize();
            toCenter.mult(random(1, 2) * settings.simulationSpeed);
            this.dx = toCenter.x;
            this.dy = toCenter.y;
            this.velocity.set(this.dx, this.dy);
            
            // Set body and head to face inward
            this.bodyDirection = toCenter.heading();
            this.headRotationTarget = toCenter.heading();
        }
        
        // Check for eye contact with others
        if (participants && participants.length > 0) {
            this.checkEyeContact(participants, settings.timeoutDuration * 1000);
        }
    }
    
    /**
     * Update the participant's position, direction, and status
     * @param {Array} participants - All participants in the simulation
     * @param {number} squareSize - Size of the square area
     * @param {Object} settings - Simulation settings
     * @param {number} deltaTime - Time since last frame in seconds
     * @param {boolean} skipExclusion - Whether to skip exclusion check (used during grace period)
     */
    update(participants, squareSize, settings, deltaTime, skipExclusion = false) {
        // Handle different movement states
        if (!this.isExcluded && this.isInside) {
            // Normal movement inside square
            this.updateNormalMovement(squareSize, deltaTime);
        } else if (this.isMovingToEdge) {
            // Moving towards edge when excluded
            this.updateMovingToEdge(squareSize, deltaTime, settings);
        } else if (this.isExcluded) {
            // At edge, not moving but actively seeking eye contact
            this.updateGazeSeeking(squareSize, deltaTime, settings);
        } else if (!this.isInside && !this.isExcluded) {
            // Initial movement from outside to inside
            this.updateInitialMovement(squareSize, deltaTime, settings, participants);
        }
        
        // Only check for eye contact if not excluded
        if (!this.isExcluded && !this.isMovingToEdge) {
            this.checkEyeContact(participants, settings.timeoutDuration * 1000);
            
            // Check if we should be excluded (no eye contact for too long)
            if (!skipExclusion) {
                let currentTime = millis();
                if (this.isInside && !this.hasEyeContact) {
                    if (currentTime - this.lastEyeContactTime > settings.timeoutDuration * 1000) {
                        console.log(`Participant ${this.id} being excluded (timeout: ${settings.timeoutDuration}s)`);
                        this.startExclusion();
                    }
                }
            }
        } else if (this.isExcluded && !this.isMovingToEdge) {
            // At edge, check for eye contact with participants inside
            this.checkReentry(participants);
        }
        
        // Track time spent inside/outside
        let currentTime = millis();
        let timeDiff = currentTime - this.lastStatusChangeTime;
        
        if (this.isInside) {
            this.totalTimeInside += timeDiff;
        } else {
            this.totalTimeOutside += timeDiff;
        }
        this.lastStatusChangeTime = currentTime;
        
        // Smoothly rotate head towards target even when not moving
        let headDiff = this.headRotationTarget - this.headDirection;
        // Ensure we rotate the shorter way around the circle
        if (headDiff > PI) headDiff -= TWO_PI;
        if (headDiff < -PI) headDiff += TWO_PI;
        this.headDirection += headDiff * this.headRotationSpeed * deltaTime;
    }
    
    /**
     * Update gaze direction for excluded participants at the edge
     * @param {number} squareSize - Size of the square area
     * @param {number} deltaTime - Time since last frame in seconds
     * @param {Object} settings - Simulation settings 
     */
    updateGazeSeeking(squareSize, deltaTime, settings) {
        // Define gaze behavior based on position on the edge
        const halfSize = squareSize / 2;
        
        // Determine which edge the participant is on
        let edgePosition = '';
        if (abs(this.position.x - halfSize) < 5) edgePosition = 'right';
        if (abs(this.position.x + halfSize) < 5) edgePosition = 'left';
        if (abs(this.position.y - halfSize) < 5) edgePosition = 'bottom';
        if (abs(this.position.y + halfSize) < 5) edgePosition = 'top';
        
        // Update time for the sweep
        if (!this.gazeSweepTime) this.gazeSweepTime = 0;
        this.gazeSweepTime += deltaTime;
        
        // Calculate target angle based on edge position for a periodic sweep
        let targetAngle;
        
        // Use mixed approach: 80% periodic sweep, 20% random jumps
        if (random() < 0.2) {
            // Random jump - look at a random point in the square
            let randomX = random(-halfSize * 0.8, halfSize * 0.8);
            let randomY = random(-halfSize * 0.8, halfSize * 0.8);
            let vectorToRandom = createVector(randomX - this.position.x, randomY - this.position.y);
            targetAngle = vectorToRandom.heading();
            // Set to jump immediately to this angle
            this.headDirection = targetAngle;
            this.headRotationTarget = targetAngle;
            this.gazeSweepTime = 0; // Reset sweep timer after a jump
        } else {
            // Periodic sweep - sweep back and forth across the square
            // Calculate the center of the angle range to look at based on edge position
            let centerAngle = 0;
            let sweepRange = PI * 0.9; // About 160 degrees sweep range
            
            if (edgePosition === 'right') centerAngle = PI;
            else if (edgePosition === 'left') centerAngle = 0;
            else if (edgePosition === 'bottom') centerAngle = -PI/2;
            else if (edgePosition === 'top') centerAngle = PI/2;
            
            // Calculate a periodic sweep using a sine wave
            // The sine wave oscillates between -1 and 1, so we scale by half the sweep range
            const frequency = 0.7; // Slower sweep
            targetAngle = centerAngle + (Math.sin(this.gazeSweepTime * frequency) * (sweepRange / 2));
            this.headRotationTarget = targetAngle;
        }
        
        // Make head rotation speed faster for excluded participants
        // This makes their searching behavior more obvious
        let seekingHeadSpeed = this.headRotationSpeed * 1.5;
        
        // Smoothly rotate head towards target with faster speed
        let headDiff = this.headRotationTarget - this.headDirection;
        // Ensure we rotate the shorter way around the circle
        if (headDiff > PI) headDiff -= TWO_PI;
        if (headDiff < -PI) headDiff += TWO_PI;
        this.headDirection += headDiff * seekingHeadSpeed * deltaTime;
    }
    
    /**
     * Calculate the nearest point on the edge of the square
     * @param {number} halfSize - Half the size of the square
     */
    calculateEdgeTarget(halfSize) {
        // Figure out which edge is closest and set target there
        let distToLeft = abs(this.position.x + halfSize);
        let distToRight = abs(this.position.x - halfSize);
        let distToTop = abs(this.position.y + halfSize);
        let distToBottom = abs(this.position.y - halfSize);
        
        let minDist = min(distToLeft, distToRight, distToTop, distToBottom);
        
        if (minDist === distToLeft) {
            // Left edge is closest
            this.edgeTarget = createVector(-halfSize, this.position.y);
        } else if (minDist === distToRight) {
            // Right edge is closest
            this.edgeTarget = createVector(halfSize, this.position.y);
        } else if (minDist === distToTop) {
            // Top edge is closest
            this.edgeTarget = createVector(this.position.x, -halfSize);
        } else {
            // Bottom edge is closest
            this.edgeTarget = createVector(this.position.x, halfSize);
        }
    }
    
    /**
     * Check if this participant has eye contact with others
     * @param {Array} participants - All participants in the simulation
     * @param {number} exclusionTimeout - Time in ms before exclusion
     */
    checkEyeContact(participants, exclusionTimeout) {
        let hadEyeContact = this.hasEyeContact;
        this.hasEyeContact = false;
        this.eyeContactPartnerId = null;
        
        // Skip if excluded or moving to edge
        if (this.isExcluded || this.isMovingToEdge) return;
        
        // For each other participant, check for mutual eye contact
        for (let other of participants) {
            // Skip if same participant, or if other is excluded or moving to edge
            if (other.id === this.id || other.isExcluded || other.isMovingToEdge) continue;
            
            // Check if other is in our field of view
            if (this.canSee(other)) {
                // Check if we are in their field of view (mutual)
                if (other.canSee(this)) {
                    this.hasEyeContact = true;
                    this.eyeContactPartnerId = other.id;
                    this.lastEyeContactTime = millis();
                    
                    // Count new eye contacts
                    if (!hadEyeContact) {
                        this.eyeContactCount++;
                    }
                    
                    break;
                }
            }
        }
    }
    
    /**
     * Check if this participant should reenter the square
     * @param {Array} participants - All participants in the simulation
     */
    checkReentry(participants) {
        // Skip if not excluded or still moving to edge
        if (!this.isExcluded || this.isMovingToEdge) return;
        
        // Check for eye contact with any participant inside
        for (let other of participants) {
            // Skip if same participant, or if other is excluded or moving to edge
            if (other.id === this.id || other.isExcluded || other.isMovingToEdge) continue;
            
            // Skip if other is not inside
            if (!other.isInside) continue;
            
            // Check if mutual eye contact
            if (this.canSee(other) && other.canSee(this)) {
                console.log(`Participant ${this.id} reentering after eye contact with ${other.id}`);
                this.reenter();
                break;
            }
        }
    }
    
    /**
     * Start the exclusion process
     */
    startExclusion() {
        if (!this.isExcluded && !this.isMovingToEdge) {
            this.isExcluded = true;
            this.isMovingToEdge = true;
            this.edgeTarget = null; // Will be calculated in the next update
            this.exitCount++;
        }
    }
    
    /**
     * Check if this participant can see another participant
     * @param {Participant} other - The other participant
     * @returns {boolean} True if the other participant is in the field of view
     */
    canSee(other) {
        // Calculate vector to other participant
        let toOther = p5.Vector.sub(other.position, this.position);
        
        // Check distance
        let distance = toOther.mag();
        if (distance > this.visionDistance) {
            return false;
        }
        
        // Check angle
        let angleToOther = toOther.heading();
        let relativeDegree = degrees(angleToOther - this.headDirection);
        
        // Normalize to -180 to 180
        while (relativeDegree > 180) relativeDegree -= 360;
        while (relativeDegree < -180) relativeDegree += 360;
        
        // Check if within vision angle
        return abs(relativeDegree) <= degrees(this.visionAngle) / 2;
    }
    
    /**
     * Re-enter the square
     */
    reenter() {
        if (this.isExcluded && !this.isMovingToEdge) {
            console.log(`Participant ${this.id} reentering`);
            
            // Reset exclusion status
            this.isExcluded = false;
            this.isInside = true;
            this.lastStatusChangeTime = millis();
            this.lastEyeContactTime = millis(); // Reset eye contact timer
            
            // Move slightly inward from the edge
            const halfSize = 200; // Default value if edge position is uncertain
            const moveDistance = 20; // Distance to move inward
            
            // Determine which edge we're on
            if (abs(this.position.x) >= halfSize - 5) {
                // On the left or right edge
                // Move inward perpendicular to the edge
                const dirX = -this.sign(this.position.x);
                this.position.x += dirX * moveDistance;
                
                // Set velocity to move away from edge with some random element
                this.dx = dirX * random(1, 2);
                this.dy = random(-1, 1);
            } else if (abs(this.position.y) >= halfSize - 5) {
                // On the top or bottom edge
                // Move inward perpendicular to the edge
                const dirY = -this.sign(this.position.y);
                this.position.y += dirY * moveDistance;
                
                // Set velocity to move away from edge with some random element
                this.dx = random(-1, 1);
                this.dy = dirY * random(1, 2);
            } else {
                // Not clearly on an edge, move toward center
                let towardCenter = createVector(-this.position.x, -this.position.y);
                towardCenter.setMag(moveDistance);
                this.position.add(towardCenter);
                
                // Random velocity
                this.dx = random(-2, 2);
                this.dy = random(-2, 2);
            }
            
            // Ensure velocity is not too small
            if (abs(this.dx) < 0.5) this.dx = (this.dx >= 0) ? 0.5 : -0.5;
            if (abs(this.dy) < 0.5) this.dy = (this.dy >= 0) ? 0.5 : -0.5;
            
            // Update velocity vector
            this.velocity.set(this.dx, this.dy);
            this.bodyDirection = this.velocity.heading();
            this.headRotationTarget = this.bodyDirection;
        }
    }
    
    /**
     * Helper to get sign of a number
     * @param {number} x - Input number
     * @returns {number} 1 for positive, -1 for negative, 0 for zero
     */
    sign(x) {
        return x > 0 ? 1 : x < 0 ? -1 : 0;
    }
    
    /**
     * Draw the participant on the canvas
     * @param {number} squareSize - Size of the square area
     */
    draw(squareSize) {
        push();
        translate(this.position.x, this.position.y);
        
        // Draw vision cone (only if not moving to edge)
        if (!this.isMovingToEdge) {
            let visionHalfAngle = this.visionAngle / 2;
            if (this.hasEyeContact) {
                fill(this.eyeContactColor.levels[0], this.eyeContactColor.levels[1], 
                    this.eyeContactColor.levels[2], 40);
            } else {
                let currentColor = this.isExcluded ? this.excludedColor : this.color;
                fill(currentColor.levels[0], currentColor.levels[1], currentColor.levels[2], 40);
            }
            
            noStroke();
            beginShape();
            vertex(0, 0);
            for (let a = -visionHalfAngle; a <= visionHalfAngle; a += 0.1) {
                let x = cos(this.headDirection + a) * this.visionDistance;
                let y = sin(this.headDirection + a) * this.visionDistance;
                vertex(x, y);
            }
            endShape(CLOSE);
        }
        
        // Draw the body (circle)
        if (this.isMovingToEdge) {
            // Special color for being excluded and moving to edge
            fill(this.movingToEdgeColor);
        } else if (this.isExcluded) {
            // At edge, stopped
            fill(this.excludedColor);
        } else if (this.hasEyeContact) {
            fill(this.eyeContactColor);
        } else {
            fill(this.color);
        }
        
        stroke(0, 50);
        ellipse(0, 0, this.size, this.size);
        
        // Draw direction indicator (body direction)
        stroke(0, 100);
        let bodyX = cos(this.bodyDirection) * (this.size * 0.7);
        let bodyY = sin(this.bodyDirection) * (this.size * 0.7);
        line(0, 0, bodyX, bodyY);
        
        // Draw head direction (stronger line)
        stroke(0);
        let headX = cos(this.headDirection) * this.size;
        let headY = sin(this.headDirection) * this.size;
        line(0, 0, headX, headY);
        
        pop();
    }
}
