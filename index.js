const express = require('express'),
    morgan = require('morgan'),
    fs = require('fs'),
    path = require('path');

const app = express();

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})

let topTenMovies = [
    {
      title: 'The Dark Knight',
    },
    {
      title: 'The Lord of the Rings: The Return of the King',
    },
    {
      title: 'The Lord of the Rings: The Fellowship of the Ring',
    },
    {
      title: 'The Lord of the Rings: The Two Towers',
    },
    {
      title: 'Fight Club',
    },
    {
      title: 'Inception',
    },
    {
      title: 'The Matrix',
    },
    {
      title: 'Se7en',
    },
    {
      title: 'Interstellar',
    },
    {
      title: 'Terminator 2: Judgement Day'
    }        
  ];

app.use(morgan('combined', {stream: accessLogStream}));
app.use(express.static('public'));

app.get('/movies', (req, res) => {                  
    res.json(topTenMovies);
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