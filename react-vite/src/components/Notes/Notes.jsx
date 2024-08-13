import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { thunkGetCurrentUsersNotes } from '../../redux/notes';
import Sidebar from '../Sidebar';
import QuillEditor from '../QuillEditor';
import 'quill/dist/quill.snow.css';
import './Notes.css';

function Notes() {
    const dispatch = useDispatch();
    const notes = useSelector(state => state.notes.userNotes);
    const [currentContent, setCurrentContent] = useState("")
    const [selectedNoteId, setSelectedNoteId] = useState(null);
    const [title, setTitle] = useState("");
    // const [errors, setErrors] = useState({})
    // const [content, setContent] = useState("")


    useEffect(() => {
        dispatch(thunkGetCurrentUsersNotes());
    }, [dispatch]);

    const handleNoteClick = (noteId) => {
        const selectedNote = notes.find(note => note.id === noteId)
        if (selectedNote) {
            setSelectedNoteId(noteId);
            setCurrentContent(selectedNote.content || "");
            setTitle(selectedNote.title || "");
        }
    }

    const handleContentChange = (newContent) => {
        setCurrentContent(newContent);
    }

    const handleTitleChange = (newTitle) => {
        setTitle(newTitle);
    };

    console.log('Rendering notes:', notes);

    return (
        <>
            <div className="notes-page-container">
                <Sidebar />
                <div className="notes-main-content">
                    <div className="notes-left">
                        <section className='notes-section1'>
                            <p className="text-notes">Notes</p>
                        </section>
                        <section className="notes-section2">
                            {!notes.length ? (
                                <p>No notes available</p>
                            ) : (
                                <>
                                    {notes.length > 1 ? (
                                        <p>{notes.length} notes</p>
                                    ) : (
                                        <p>1 note</p>
                                    )}
                                </>
                            )}
                        </section>
                        <section className='notes-section3'>
                            {notes.map(note => (
                                <div
                                    key={note.id}
                                    className={`note-container ${selectedNoteId === note.id ? 'selected' : ''}`}
                                    onClick={() => handleNoteClick(note.id)}
                                >
                                    <div className="note-item-title">{note.title}</div>
                                    <div className="note-item-content">{note.content}</div>
                                </div>
                            ))}
                        </section>
                    </div>
                    <div className="notes-editor-section">
                        {selectedNoteId && (
                            <QuillEditor
                                noteId={selectedNoteId}
                                initialContent={currentContent}
                                initialTitle={title}
                                onContentChange={handleContentChange}
                                onTitleChange={handleTitleChange}
                            />
                        )}
                    </div>
                </div >
            </div >
        </>
    )
}

export default Notes;
