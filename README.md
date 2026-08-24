# System-Driven RPG Prototype

A modular RPG prototype focused on event-driven systems and data-driven design.

This project explores how gameplay systems, UI, and data can be structured to work together without tight coupling.

---

## Features

- Combat system with enemy-driven behavior  
- Gathering system with progress and respawn  
- Processing / crafting system  
- Inventory with item actions  
- Equipment with socket-based casing system  
- Vita system (experimental build mechanic)  
- Node-based world map  

---

## Architecture

The project is built around a system-based architecture:

- Systems communicate through an event bus  
- UI is separated from game logic  
- A UI sync layer connects systems to UI  
- Most gameplay is data-driven (items, enemies, recipes, map)  

Flow example:
UI → translation → system → UI sync → UI

---

## Learning Approach

This project was created as part of my learning process.

I used AI-assisted development to explore patterns and speed up iteration, while focusing on understanding:

- how systems communicate  
- how to structure code around events  
- how to separate UI, logic, and data  

I have worked through the code to understand how it functions and how the different systems interact, and I am continuing to build the ability to implement similar systems independently.

---

## Goal

The goal of this project is to develop the ability to think in systems, rather than just building isolated features.
