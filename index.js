const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
require('dotenv').config()
const { v4: uuidv4 } = require('uuid');

const users = [];

app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({
  extended: true
}));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


app.post('/api/users', (req, res) => {
  const newUser = {
    username: req.body.username,
    _id: uuidv4(),
    exercises: []
  }
  users.push(newUser)
  res.json({
    username: newUser.username,
    _id: newUser._id
  });
});

app.get('/api/users', (req, res) => {
  res.send(users);
})

app.post('/api/users/:_id/exercises', (req, res) => {
  const userId = req.params._id;
  const user = users.find(user => user._id === userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  console.log(user.exercises);
  const { description, duration, date } = req.body;
  const exerciseDate = date ? new Date(date) : new Date();

  const exercise = {
    description: description,
    duration: parseInt(duration),
    date: exerciseDate.toDateString(),
  };

  if (!user.exercises) {
    user.exercises = [];
  }
  user.exercises.push(exercise);

  res.json({
    username: user.username,
    description: exercise.description,
    duration: exercise.duration,
    date: exercise.date,
    _id: userId
  });
});


app.get('/api/users/:_id/logs', (req, res) => {
  
  const userId = req.params._id;
  const user = users.find(user => user._id === userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  let { from, to, limit } = req.query;

  if (from) {
    from = new Date(from);
  }
  if (to) {
    to = new Date(to);
  }

  let filteredExercises = user.exercises;
  if (from) {
    filteredExercises = filteredExercises.filter(exercise => new Date(exercise.date) >= from);
  }
  if (to) {
    filteredExercises = filteredExercises.filter(exercise => new Date(exercise.date) <= to);
  }

  if (limit) {
    filteredExercises = filteredExercises.slice(0, parseInt(limit));
  }

  const log = {
    username: user.username,
    count: filteredExercises.length,
    log: filteredExercises
  }

  res.json(log);
})


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
