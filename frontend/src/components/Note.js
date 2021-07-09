const Note = ({note, toggleImportance}) => {
  const label = note.important
    ? 'make not important' : 'make important';
  return (
    <li>
      <li className="note">{note.content}</li>
      <button onClick={toggleImportance}>{label}</button>

    </li>
  )
}

export default Note;