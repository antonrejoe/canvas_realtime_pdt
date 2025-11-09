
# Collaborative Drawing Application

A real-time collaborative drawing platform enabling multiple users to create and join rooms to draw together on a shared canvas, supporting desktop and mobile devices.

***

## Table of Contents

- [Introduction](#introduction)
- [Prototype](#prototype)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Architecture](#architecture)
- [Technologies](#technologies)
- [Limitations](#limitations)
- [Timeline](#timeline)

## Introduction

This application allows multiple users to draw together simultaneously in isolated rooms. Each room maintains its own drawing state with support for undo/redo, various brush types, and color selection. It leverages a Node.js server with Socket.io for WebSocket communication and uses MessagePack to efficiently encode drawing data.

The client is built with HTML5 canvas and JavaScript supporting both mouse and touch inputs, making it mobile-friendly.

***

## Prototype
  [demo.webm](https://github.com/user-attachments/assets/620481fb-190e-4aa2-a4e0-b744099f3937)

## Features

- Real-time multi-user collaborative drawing with low latency
- Room-based isolation ensuring separate drawing spaces
- Undo and redo functionality per user
- Six brush types: normal, spray, calligraphy, sketchy, marker, fur
- Customizable brush size and colors
- Real-time cursor indicators for all participants
- Mobile device compatibility with touch events and responsive UI
- Efficient binary message encoding with MessagePack
- Automatic cleanup of empty rooms

***

## Installation

1. Ensure you have Node.js installed (v14+ recommended).
2. Clone the repository.
3. Install dependencies:

```bash
npm install
```

4. Start the server:

```bash
node server.js
```

5. Open `index.html` in your browser or serve it via a local server (`Live Server`, `http-server` etc.).

***

## Usage

- Open the app in one or more browser windows or devices.
- Create a new room or join an existing room by entering the room ID.
- Use the toggle draw button to enable/disable drawing.
- Select brush type, size, and color as desired.
- Draw on the canvas; other users in the same room will see your strokes in real-time.
- Undo or redo your strokes using the buttons.
- Clear your own drawing with the clear button.
- Move your mouse or finger to see your cursor location reflected to others.
- Leave the room with the leave button.

## Architecture
- Refer to ARCHITECTURE.md

## Technologies

- Node.js, Socket.io (server and client)
- HTML5 Canvas API
- JavaScript ES6 modules
- MessagePack for binary encoding
- Responsive CSS for cross-device support

## Limitations
- No persistent storage
- Single Server Architecture
- No User Authentication
- No Room Password protection
- No Drawing history export
- No Rate limiting or Flood protection
- No Advanced drawing tools

## Timeline
- Day 1 - Basic UI and research on the Canvas API and Socket.io for real-time communication.
- Day 2 - Implementation of drawing tools using advanced stroke manipulation.
- Day 3 - Enabled multi-user synchronization of cursor coordinates and drawing strokes via Socket.io (without persistent state management).
- Day 4 - Added user synchronization and robust state management for consistent drawing sessions.
- Day 5 - Introduced room-based collaboration, mobile support, improved styling, and deployed the application.

