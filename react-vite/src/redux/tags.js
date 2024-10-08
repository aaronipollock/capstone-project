import { setTagsByNoteId } from './notesSlice';
import { removeTagFromNote } from './notesSlice';
import { removeTagFromAllNotes } from './notesSlice';


// Action Types
const GET_ALL_TAGS = 'tags/GET_ALL_TAGS';
const CREATE_TAG = 'tags/CREATE_TAG';
const GET_TAGS_FOR_NOTE = 'tags/GET_TAGS_FOR_NOTE';
const ADD_TAG_TO_NOTE = 'tags/ADD_TAG_TO_NOTE';
const REMOVE_TAG_FROM_NOTE = 'tags/REMOVE_TAG_FROM_NOTE';
const UPDATE_TAG = 'tags/UPDATE_TAG';
const DELETE_TAG = 'tags/DELETE_TAG';


// Action Creators
const getAllTags = (tags) => ({
    type: GET_ALL_TAGS,
    payload: tags
});

const createTag = (tag) => ({
    type: CREATE_TAG,
    payload: tag
})

// const getTagsForNote = (noteId, tags) => ({
//     type: GET_TAGS_FOR_NOTE,
//     noteId,
//     payload: tags,
// })

const addTagToNote = (noteId, tag) => ({
    type: ADD_TAG_TO_NOTE,
    noteId,
    payload: tag
});

// const removeTagFromNote = (noteId, tagId) => ({
//     type: REMOVE_TAG_FROM_NOTE,
//     noteId,
//     tagId
// });

const updateTag = (tag) => ({
    type: UPDATE_TAG,
    payload: tag
});

// const deleteTag = (tagId) => ({
//     type: DELETE_TAG,
//     tagId
// })

// Thunks
export const thunkGetAllTags = () => async (dispatch) => {
    const res = await fetch(`/api/tags/`);
    if (res.ok) {
        const tags = await res.json();
        dispatch(getAllTags(tags));
    }
};

export const thunkCreateTag = (tagName) => async (dispatch) => {
    const res = await fetch('/api/tags/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: tagName })
    });
    if (res.ok) {
        const newTag = await res.json();
        dispatch(createTag(newTag));
    }
};

export const thunkGetTagsForNote = (noteId) => async (dispatch) => {
    try {
        const res = await fetch(`/api/tags/notes/${noteId}`);

        if (!res.ok) {
            const errorText = await res.text();
            console.error('Error fetching tags:', errorText);
            return;
        }
        const tags = await res.json();
        dispatch(setTagsByNoteId(noteId, tags));
    } catch (error) {
        console.error('Failed to fetch tags:', error);
    }
};
// export const thunkGetTagsForNote = (noteId) => async (dispatch) => {
//     try {
//         const tags = await fetchTagsForNoteFromAPI(noteId);
//         dispatch(setTagsByNoteId({ noteId, tags }));
//     } catch (error) {
//         console.error('Failed to fetch tags:', error);
//     }
// };


export const thunkAddTagToNote = (noteId, newTag) => async (dispatch) => {
    console.log('Sending tags to server:', newTag);

    const res = await fetch(`/api/tags/notes/${noteId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tag_name: newTag.tag_name, user_id: newTag.user_id })
    });
    if (res.ok) {
        const tag = await res.json();
        dispatch(addTagToNote(noteId, tag));
    }
};

export const thunkRemoveTagFromNote = (noteId, tagId) => async (dispatch) => {
    console.log(`Dispatching thunkRemoveTagFromNote with noteId: ${noteId}, tagId: ${tagId}`);
    const res = await fetch(`/api/tags/${tagId}/notes/${noteId}/remove`, {
        method: 'DELETE'
    });

    if (res.ok) {
        console.log(`Tag with id ${tagId} successfully removed from note ${noteId}`);
        dispatch(removeTagFromNote(noteId, tagId));
    } else {
        console.error("Error removing tag from note:", await res.text());
    }
};


export const thunkUpdateTag = (tagId, tag_name) => async (dispatch) => {
    const res = await fetch(`/api/tags/${tagId}/edit`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tag_name })
    });
    if (res.ok) {
        const updatedTag = await res.json();
        dispatch(updateTag(updatedTag));
    }
};

export const thunkDeleteTag = (tagId) => async (dispatch) => {
    console.log(`Dispatching thunkDeleteTag with tagId: ${tagId}`);
    const res = await fetch(`/api/tags/${tagId}/delete`, { method: 'DELETE' });

    if (res.ok) {
        console.log(`Tag with id ${tagId} successfully deleted`);
        dispatch(removeTagFromAllNotes(tagId)); // Remove the tag from all notes in the Redux state
    } else {
        console.error("Error deleting tag:", await res.text());
    }
};


// Initial State
const initialState = {
    allTags: [],
    tagsByNoteId: {},
};

// Reducer
export default function tagReducer(state = initialState, action) {
    switch (action.type) {
        case GET_ALL_TAGS:
            return {
                ...state,
                allTags: action.payload
            };
        case CREATE_TAG:
            return {
                ...state,
                allTags: [...state.allTags, action.payload]
            };
        case GET_TAGS_FOR_NOTE:
            return {
                ...state,
                tagsByNoteId: {
                    ...state.tagsByNoteId,
                    [action.noteId]: action.payload
                }
            };
        case ADD_TAG_TO_NOTE: {
            console.log('Action received:', action);
            console.log('Current state:', state);
            const { noteId, payload } = action
            console.log('Updated noteId:', noteId);
            console.log('Payload:', payload);

            return {
                ...state,
                tagsByNoteId: {
                    ...state.tagsByNoteId,
                    [noteId]: [...(state.tagsByNoteId[noteId] || []), payload]
                }
            };
        }
        case REMOVE_TAG_FROM_NOTE:
            if (!state.tagsByNoteId[action.noteId]) {
                return state;
            }

            return {
                ...state,
                tagsByNoteId: {
                    ...state.tagsByNoteId,
                    [action.noteId]: state.tagsByNoteId[action.noteId].filter(tag => tag.id !== action.tagId)
                }
            }
        case UPDATE_TAG:
            return {
                ...state,
                allTags: state.allTags.map(tag =>
                    tag.id === action.payload.id ? action.payload : tag
                )
            };
        case DELETE_TAG:
            // Remove the tag from all notes in the `tagsByNoteId`
            return {
                ...state,
                tagsByNoteId: Object.keys(state.tagsByNoteId).reduce((acc, noteId) => {
                    acc[noteId] = state.tagsByNoteId[noteId].filter(tag => tag.id !== action.tagId);
                    return acc;
                }, {}),
                allTags: state.allTags.filter(tag => tag.id !== action.tagId),  // Also remove from global tag list
            };

        // case DELETE_TAG:
        //     return {
        //         ...state,
        //         allTags: state.allTags.filter(tag => tag.id !== action.tagId)
        //     };
        default:
            return state;
    }
}
