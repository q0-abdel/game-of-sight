# Game of Sight: A Theater Exercise Simulation

## Project Description
Game of Sight is a web application that simulates a theater exercise where participants must maintain eye contact with each other to remain within a designated square area. Participants move continuously within the space and have distinct head and body orientations.

If a participant fails to make eye contact with another participant for a specified time period, they are excluded from the square. Excluded participants can re-enter the square by establishing eye contact with someone inside.

The simulation serves as a visual metaphor for group dynamics and mutual support through eye contact.

## Context
This project is the result of a no-code development approach:

- I'm a total beginner in programming ("totally newbie coding").
- The project was built using AI-powered tools (specifically Windsurf IDE) to test an idea without writing any code myself.
- The total project time taken for v1 was only **2h30**.
- The initial inspiration came from a real-life theater exercise and the desire to model it, similar in concept to an "Evolution Simulator."

The development process involved using:
- Claude (through Google AI Studio) with a system prompt to translate human language descriptions into technical specifications.
- Windsurf IDE for code generation and iterative refinement based on feedback.

Key milestones included:
1. Initial visualization of participants with vision cones
2. Implementation of eye contact detection and exclusion logic
3. Development of participant movement patterns
4. Creation of statistics tracking
5. Adding UI controls and parameters
6. Designing the game over popup with restart functionality

I'm starting my journey in programming from scratch. While I don't have prior coding experience, I'm excited to develop my programming skills and explore the possibilities that modern AI-powered tools offer. I'm particularly interested in using cutting-edge AI development environments like Windsurf IDE, which enables Vibe Coding - a new way of creating software with AI assistance.

## How to Run

1. Open the `index.html` file in your web browser (Chrome, Firefox, or Edge recommended).
2. Adjust the parameters as desired:
   - **Nombre de participants**: How many people to include in the simulation
   - **Taille du carré**: Size of the square area
   - **Durée limite avant exclusion (s)**: Time in seconds without eye contact before being excluded
   - **Vitesse de simulation**: Overall movement speed
   - **Angle du champ de vision**: Vision cone angle in degrees
   - **Vitesse de rotation de tête**: How fast participants can turn their heads

3. Click the "Lancer" (Start) button to begin the simulation.
4. Use "Pause" to temporarily freeze the simulation and "Réinitialiser" (Reset) to start over.

## Key Features

- **Visual Simulation**: Birds-eye view of participants with vision cones
- **Parameter Customization**: Adjust all aspects of the simulation
- **Real-Time Statistics**: Track participants inside/outside, eye contacts made, etc.
- **Exclusion Logic**: Participants without eye contact are moved outside
- **Re-entry System**: Excluded participants can return by making eye contact
- **Game Over Event**: Special message when all participants are excluded

## Technology Stack

- **JavaScript**: Core programming language
- **p5.js**: Graphics and animation library
- **HTML/CSS**: User interface elements

## License

This project is open source and available for educational and creative purposes.

## Author

Q0-abdel
