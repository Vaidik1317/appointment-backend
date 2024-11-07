const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const http = require("http"); // For creating the server with Socket.io
const { Server } = require("socket.io"); // Importing Socket.io

const app = express();
const server = http.createServer(app); // Use http server to support Socket.io
const io = new Server(server, {
  cors: {
    origin: [
      "https://saanvimakeover.netlify.app",
      "http://localhost:3000",
      "https://saanvimakeover-admin.netlify.app",
      "http://saanvimakeover.in",
      "https://saanvimakeover.in",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
}); // Initialize Socket.io with CORS settings

const PORT = process.env.PORT || 5000;

// Enable CORS with specified options
app.use(
  cors({
    origin: [
      "https://saanvimakeover.netlify.app",
      "http://localhost:3000",
      "https://saanvimakeover-admin.netlify.app",
      "http://saanvimakeover.in",
      "https://saanvimakeover.in",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    optionsSuccessStatus: 200,
  })
);

app.use(bodyParser.json());

// MongoDB connection
mongoose
  .connect(
    "mongodb+srv://root:12345@cluster0.ct6q6.mongodb.net/appointment?retryWrites=true&w=majority&appName=Cluster0",
    {
      serverSelectionTimeoutMS: 20000,
      socketTimeoutMS: 45000,
    }
  )
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Appointment Schema
const AppointmentSchema = new mongoose.Schema({
  name: String,
  number: Number,
  selectedOption: String,
  datetime: Date,
  status: { type: String, default: "pending" },
});

const Appointment = mongoose.model("Appointment", AppointmentSchema);

// When a client connects to Socket.io
io.on("connection", (socket) => {
  console.log("Admin connected to WebSocket for real-time updates");
  socket.on("disconnect", () => {
    console.log("Admin disconnected");
  });
});

// Routes
app.get("/api/appointments", (req, res) => {
  Appointment.find()
    .then((appointments) => res.status(200).json(appointments))
    .catch((err) => {
      console.error("Error fetching appointments:", err);
      res.status(500).json({ error: err.message });
    });
});

app.get("/api/appointments/:id", (req, res) => {
  const appointmentId = req.params.id;

  Appointment.findById(appointmentId)
    .then((appointment) => {
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      res.status(200).json(appointment);
    })
    .catch((err) => {
      console.error("Error fetching appointment by ID:", err);
      res.status(500).json({ error: err.message });
    });
});

app.post("/api/appointments", (req, res) => {
  console.log("Received data:", req.body);
  const newAppointment = new Appointment(req.body);
  newAppointment
    .save()
    .then((savedAppointment) => {
      res.status(201).json(savedAppointment);
      // Emit the new appointment to connected clients (admin)
      io.emit("newAppointment", savedAppointment);
    })
    .catch((err) => {
      console.error("Error saving appointment:", err);
      res.status(500).json({ error: err.message });
    });
});

app.put("/api/appointments/accept/:id", (req, res) => {
  const appointmentId = req.params.id;
  Appointment.findByIdAndUpdate(
    appointmentId,
    { status: "accepted" },
    { new: true }
  )
    .then((updatedAppointment) => {
      if (!updatedAppointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      res.status(200).json(updatedAppointment);
    })
    .catch((err) => {
      console.error("Error updating appointment:", err);
      res.status(500).json({ error: err.message });
    });
});

// Start the server with Socket.io
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
