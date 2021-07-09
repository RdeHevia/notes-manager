const notesRouter = require('express').Router();
const Note = require('../models/note');

// ROUTES for...
// ...fetching a collection.
// Sent as a json file and set the Content-Type to 'application/json'
notesRouter.get('/', (req, res) => {
  Note.find({}).then(notes => {
    res.json(notes);
  });
});

// ...fetching a single resource (element)
notesRouter.get('/:id', (req, res, next) => {
  Note.findById(req.params.id).then(note => {
    if (note) {
      res.json(note);
    } else {
      res.status(404).end();
    }
  }).catch(error => next(error));
});

// ...create a new resource
notesRouter.post('/', (req, res, next) => {
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
});

notesRouter.put('/:id', (req, res, next) => {
  const body = req.body;

  const note = {
    content: body.content,
    important: body.important
  };

  Note.findByIdAndUpdate(req.params.id, note, {new: true})
    .then(updatedNote => {
      res.json(updatedNote);
    }).catch(error => next(error));
});

// ...deleting a single resource
notesRouter.delete('/:id', (req, res, next) => {

  Note.findByIdAndRemove(req.params.id).then(() => {
    res.status(204).end();
  }).catch(error => next(error));
});

module.exports = notesRouter;