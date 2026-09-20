import { io } from "socket.io-client";

// Connect to socket backend (using proxy or current origin)
const socketURL = window.location.hostname === "localhost" 
  ? "http://localhost:4000" 
  : window.location.origin;

export const socket = io(socketURL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
});
