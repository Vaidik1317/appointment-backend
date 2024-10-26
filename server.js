const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// CORS options
const corsOptions = {
  origin: ["https://joyful-elf-684250.netlify.app", "http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  optionsSuccessStatus: 200,
};

// Enable CORS with specified options
app.use(cors(corsOptions));

// Allow JSON parsing
app.use(bodyParser.json());

// MongoDB connection
mongoose
  .connect(
    "mongodb+srv://root:12345@cluster0.ct6q6.mongodb.net/appointment?retryWrites=true&w=majority&appName=Cluster0",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 20000, // Increase timeout
      socketTimeoutMS: 45000, // Increase socket timeout
    }
  )
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Appointment Schema
const AppointmentSchema = new mongoose.Schema({
  name: String,
  email: String,
  datetime: Date,
  status: { type: String, default: "pending" },
});

// Appointment Model
const Appointment = mongoose.model("Appointment", AppointmentSchema);

// Routes
app.get("/api/appointments", (req, res) => {
  Appointment.find()
    .then((appointments) => res.status(200).json(appointments))
    .catch((err) => {
      console.error("Error fetching appointments:", err);
      res.status(500).json({ error: err.message });
    });
});

app.post("/api/appointments", (req, res) => {
  const newAppointment = new Appointment(req.body);
  newAppointment
    .save()
    .then((savedAppointment) => res.status(201).json(savedAppointment))
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

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
