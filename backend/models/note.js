const mongoose = require('mongoose');

// create an schema. this is used to tell Mongoose the shape of the note objects
const noteSchema = new mongoose.Schema({
  content: {
    type: String,
    minLength: 5,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  important: Boolean,
});

// set up JSON output for all the instances of noteSchema
noteSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

// creates a model. This is used to instantate Note objects
module.exports = mongoose.model('Note', noteSchema);