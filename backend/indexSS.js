require('dotenv').config();
const express = require('express');
const app = express(); // create the server app
const morgan = require('morgan');
const cors = require('cors');
const Note = require('./models/note');

// PORT: whatever is in the environment variable PORT.
const PORT = process.env.PORT;

// use cors middleware in every incoming request
app.use(cors());
// use json-parser middleware in every incoming request (that has a body)
app.use(express.json());
// allow the app to serve static files
// express will serve index.html by default to requests sent to '/'
// otherwise, the request path will need to be: /filename.extension
app.use(express.static('build'));
// log request data
app.use(morgan('dev'));

// ROUTES for...
// ...fetching a string that represents an html and sets the Content-Type to 'text/html'
app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>');
});

// ...fetching a collection.
// Sent as a json file and set the Content-Type to 'application/json'
app.get('/api/notes', (req, res) => {
  Note.find({}).then(notes => {
    res.json(notes);
  });
});

// ...fetching a single resource (element) 
app.get('/api/notes/:id', (req, res, next) => {
  Note.findById(req.params.id).then(note => {
    if (note) {
      res.json(note);
    } else {
      res.status(404).end();
    }
  }).catch(error => next(error));
});

// ...create a new resource
app.post('/api/notes', (req, res, next) => {
  const body = req.body;
  if (!body.content) {
    return res.status(400).json({error: 'content missing'});
    // set status to 400 and res with an error message in json format
  }

  const note = new Note({
    content: body.content,
    important: body.important || false,
    date: new Date()
  });

  note.save()
    .then(savedNote => savedNote.toJSON())
    .then(savedAndFormattedNote => res.json(savedAndFormattedNote))
    .catch(error => next(error));
})

app.put('/api/notes/:id', (req, res, next) => {
  const body = req.body;

  const note = {
    content: body.content,
    important: body.important
  }

  Note.findByIdAndUpdate(req.params.id, note, {new: true})
    .then(updatedNote => {
      res.json(updatedNote);
    }).catch(error => next(error));
});

// ...deleting a single resource
app.delete('/api/notes/:id', (req, res, next) => {

  Note.findByIdAndRemove(req.params.id).then(() => {
    res.status(204).end();
  }).catch(error => next(error));
})


// error handler definition
const errorHandler = (error, req, res, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' });
  }  else if (error.name === 'ValidationError') {
    return res.status(400).json({error: error.message});
  }

  next(error);
}
// error handler use
app.use(errorHandler);

// starts the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});