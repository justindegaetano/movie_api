const bodyParser = require('body-parser'),
    express = require('express'),
    morgan = require('morgan'),
    fs = require('fs'),
    path = require('path'),
    uuid = require('uuid');

const app = express();

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})

app.use(bodyParser.json());

let users = [
    {
      id: 1,
      name: 'Justin',
      favoriteMovies: []
    },
    {
      id: 2,
      name: 'Lindsey',
      favoriteMovies: ['The Matrix']
    }

];

let topTenMovies = [
    {
      'Title':'The Dark Knight', 'Genre':'Drama', 'Director':'Christopher Nolan'
    },
    {
      'Title':'The Lord of the Rings: The Return of the King', 'Genre':'Adventure', 'Director':'Peter Jackson'
    },
    {
      'Title':'The Lord of the Rings: The Fellowship of the Ring', 'Genre':'Adventure', 'Director':'Peter Jackson'
    },
    {
      'Title':'The Lord of the Rings: The Two Towers', 'Genre':'Adventure', 'Director':'Peter Jackson'
    },
    {
      'Title':'Fight Club', 'Genre': 'Drama', 'Director': 'David Fincher'
    },
    {
      'Title':'Inception', 'Genre': 'Sci-Fi', 'Director': 'Christopher Nolan'
    },
    {
      'Title':'Pulp Fiction', 'Genre': 'Drama', 'Director': 'Quentin Tarantino'
    },
    {
      'Title':'Se7en', 'Genre': 'Drama', 'Director': 'David Fincher'
    },
    {
      'Title':'Interstellar', 'Genre': 'Sci-Fi', 'Director': 'Christopher Nolan'
    },
    {
      'Title':'Terminator 2: Judgement Day', 'Genre': 'Action', 'Director': 'James Cameron'
    }        
  ];

app.use(morgan('combined', {stream: accessLogStream}));
app.use(express.static('public'));

// Create
app.post('/users', (req, res) => {
  const newUser = req.body;

  if (newUser.name) {
    newUser.id = uuid.v4();
    users.push(newUser);
    res.status(201).json(newUser)
  } else {
    res.status(400).send('User name required.')
  }

});

// Update
app.put('/users/:id', (req, res) => {
  const { id } = req.params;
  const updatedUser = req.body;

  let user = users.find(user => user.id == id);

  if (user) {
    user.name = updatedUser.name;
    res.status(200).json(user);
  } else {
    res.status(400).send('User not found.')
  }
});

// Create
app.post('/users/:id/:movieTitle', (req, res) => {
  const { id, movieTitle } = req.params;

  let user = users.find(user => user.id == id);

  if (user) {
    user.favoriteMovies.push(movieTitle);
    res.status(200).send(`${movieTitle} has been added to user ${id}'s list`);
  } else {
    res.status(400).send('User not found.')
  }
});

// Delete
app.delete('/users/:id/:movieTitle', (req, res) => {
  const { id, movieTitle } = req.params;

  let user = users.find(user => user.id == id);

  if (user) {
    user.favoriteMovies = user.favoriteMovies.filter( title => title !== movieTitle);
    res.status(200).send(`${movieTitle} has been removed from user ${id}'s list`);
  } else {
    res.status(400).send('User not found.')
  }
});

// Delete
app.delete('/users/:id', (req, res) => {
  const { id } = req.params;

  let user = users.find(user => user.id == id);

  if (user) {
    users = users.filter( user => user.id != id);
    res.status(200).send(`User ${id} has been deleted.`);
  } else {
    res.status(400).send('User not found.')
  }
});

// Read
app.get('/movies', (req, res) => {                  
    res.status(200).json(topTenMovies);
});

// Read
app.get('/movies/:title', (req, res) => {                  
    const { title } = req.params;
    const movie = topTenMovies.find( movie => movie.Title === title);
    
    if (movie) {
      res.status(200).json(movie);
    } else {
      res.status(400).send('No movie listed.')
    }
});

// Read
app.get('/movies/genre/:genreName', (req, res) => {                  
  const { genreName } = req.params;
  const genre = topTenMovies.find( movie => movie.Genre === genreName);
  
  if (genre) {
    res.status(200).json(genre);
  } else {
    res.status(400).send('No genre info listed.')
  }
});

// Read
app.get('/movies/director/:directorName', (req, res) => {                  
  const { directorName } = req.params;
  const director = topTenMovies.find( movie => movie.Director === directorName);
  
  if (director) {
    res.status(200).json(director);
  } else {
    res.status(400).send('No director found.')
  }
});

app.get('/', (req, res) => {                  
    res.send('Welcome to myFlix!');
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