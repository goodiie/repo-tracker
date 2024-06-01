// /repo-activity-tracker/server.js

const express = require('express');
const mongoose = require('mongoose');

// Create Express app
const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
    res.send("Welcome to git-repo tracker");
  });
  

// Middleware to parse JSON bodies
app.use(express.json());

// MongoDB connection
const dbURI = 'mongodb+srv://goodnessudk:zzkl40R7brkOe7UV@cluster0.domrscv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
mongoose.connect(dbURI)
.then(result => {console.log('connected to db')})
.catch(err => {console.log(err)})

// Define a schema and model for activities
const activitySchema = new mongoose.Schema({
  eventType: String,
  username: String,
  repo: String,
  createdAt: { type: Date, default: Date.now }
});

const Activity = mongoose.model('Activity', activitySchema);

// Endpoint to list all activities
app.get('/activities', async (req, res) => {
  const activities = await Activity.find();
  res.json(activities);
});

// Endpoint to get an activity by ID
app.get('/activities/:id', async (req, res) => {
  const activity = await Activity.findById(req.params.id);
  res.json(activity);
});

// Endpoint to get activities by GitHub username
app.get('/activities/user/:username', async (req, res) => {
  const activities = await Activity.find({ username: req.params.username });
  res.json(activities);
});

// Endpoint to receive GitHub webhook events
app.post('/webhooks/github', async (req, res) => {
  const { action, sender, repository } = req.body;
  const eventType = req.headers['x-github-event'];

  // Save the activity in the database
  const activity = new Activity({
    eventType,
    username: sender.login,
    repository: repository.full_name
  });

  await activity.save();
  try {res.status(201).send('Event received and saved.'); }
  catch (error) {
  res.status().send(error);
}
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});