const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: "http://localhost:3000", // Change this to the specific origin of your frontend
    credentials: true, // Allow cookies if needed
  })
);
app.use(bodyParser.json());

mongoose.connect(
  "mongodb+srv://vaidikthakkar5:sJuTIL6Dl6PC5d3F@cluster0.ct6q6.mongodb.net/appointments?retryWrites=true&w=majority&appName=Cluster0",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const AppointmentSchema = new mongoose.Schema({
  name: String,
  email: String,
  datetime: Date,
  status: { type: String, default: "pending" },
});

const Appointment = mongoose.model("Appointment", AppointmentSchema);

app.get("/api/appointments", (req, res) => {
  Appointment.find()
    .then((appointments) => res.status(200).json(appointments))
    .catch((err) => res.status(500).json({ error: err.message }));
});

app.post("/api/appointment", (req, res) => {
  const newAppointment = new Appointment(req.body);
  newAppointment
    .save()
    .then((savedAppointment) => res.status(201).json(savedAppointment))
    .catch((err) => res.status(500).json({ error: err.message }));
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
    .catch((err) => res.status(500).json({ error: err.message }));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
