/* eslint-disable max-lines-per-function */
const notesRouter = require('express').Router();
const Note = require('../models/note');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

const getTokenFrom = req => {
  const authorization = req.get('authorization');
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7);
  }

  return null;
};

// ROUTES for...
// ...fetching a collection.
// Sent as a json file and set the Content-Type to 'application/json'
notesRouter.get('/', async (req, res) => {
  const notes = await Note.find({}).populate('user', {username: 1, name: 1});
  res.json(notes);
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
notesRouter.post('/', async (req, res, next) => {
  const body = req.body;
  const token = getTokenFrom(req);
  // verify token is valid and returns object token with id and username
  const decodedToken = jwt.verify(token, process.env.SECRET);
  if (!token || !decodedToken.id) {
    return res.status(401).json({error: 'token missing or invalid'});
  }
  if (!body.content) {
    return res.status(400).json({error: 'content missing'});
    // set status to 400 and res with an error message in json format
  }

  // extract id from decode token object
  const user = await User.findById(decodedToken.id);

  const note = new Note({
    content: body.content,
    important: body.important || false,
    date: new Date(),
    user: user._id
  });

  const savedNote = await note.save().catch(err => next(err));
  user.notes = user.notes.concat(savedNote._id);
  await user.save();

  const savedAndFormattedNote = savedNote.toJSON();
  res.json(savedAndFormattedNote);
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