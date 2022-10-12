const bodyParser = require('body-parser'),
    express = require('express'),
    morgan = require('morgan'),
    fs = require('fs'),
    path = require('path'),
    uuid = require('uuid'),
    app = express(),
    accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'});

const mongoose = require('mongoose'),
    Models = require('./models.js'),
    Movies = Models.Movie,
    Users = Models.User,
    Genres = Models.Genre,
    Directors = Models.Director;

mongoose.connect('mongodb://localhost:27017/myFlixDB', { useNewUrlParser: true, useUnifiedTopology: true });

app.use(bodyParser.json());
app.use(morgan('combined', {stream: accessLogStream}));
app.use(express.static('public'));

// Text response when at /
app.get('/', (req, res) => {                  
  res.send('Welcome to myFlix!');
});

// User registration
app.post('/users', (req, res) => {
  Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + " already exists.")
      } else {
        Users.create({
          Username: req.body.Username,
          Password: req.body.Password,
          Email: req.body.Email,
          Birthday: req.body.Birthday,
        })
        .then((user) => {
          res.status(201).json(user);
        })
        .catch((err) => {
          console.error(err);
          res.status(500).send("Error:" + err);
        });
      }
    })
});

// User Deregistration
app.delete('/users/:Username', (req, res) => {
  Users.findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + " was not found");
      } else {
        res.status(200).send(req.params.Username + " was deleted.");
      }
    })
    .catch ((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    })
});

// Update user info
app.put('/users/:Username', (req, res) => {
  Users.findOneAndUpdate(
    { Username: req.params.Username },
    { 
      $set: {
          Username: req.body.Username,
          Password: req.body.Password,
          Email: req.body.Email,
          Birthday: req.body.Birthday,
      },
    },
    { new: true },
    (err, updatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error: " + err);
      } else {
        res.json(updatedUser);
      }
    }
  )
});

// Add movie to user's FavoriteMovie list
app.post('/users/:Username/movies/:MovieID', (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, {
     $push: { Fav: req.params.MovieID }
   },
   { new: true }, // This line makes sure that the updated document is returned
  (err, updatedUser) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});

// Delete movie from user's FavoriteMovie list
app.delete('/users/:Username/movies/:MovieID', (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, {
     $pull: { Fav: req.params.MovieID }
   },
   { new: true }, // This line makes sure that the updated document is returned
  (err, updatedUser) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});

// Return JSON object when at /movies
app.get('/movies', (req, res) => {                  
  Movies.find()
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    })
});

// Get JSON movie info when searching specific title
app.get('/movies/:title', (req, res) => {                  
  Movies.findOne({ Title: req.params.title })
  .then((movie) => {
    res.status(200).json(movie);
  })
  .catch((err) => {
    console.error(err);
    res.status(400).send('No movie listed.')
  })
});

// Read specific genre description
app.get('/movies/genre/:genreName', (req, res) => {                  
	Movies.findOne({ 'Genre.Name': req.params.genreName })
		.then((movie) => {
			res.json(movie.Genre);
		})
		.catch((err) => {
			console.error(err);
			res.status(500).send('Error: ' + err);
		});
});

// Read specific director bio
app.get('/movies/director/:directorName', (req, res) => {                  
	Movies.findOne({ 'Director.Name': req.params.directorName })
		.then((movie) => {
			res.json(movie.Director);
		})
		.catch((err) => {
			console.error(err);
			res.status(500).send('Error: ' + err);
		});
});

app.get('/documentation', (req, res) => {
    res.sendFile('public/documentation.html', {root: __dirname});
  });

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Rut roh! Looks like we have a problem!');
  });

app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
  });