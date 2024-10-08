from flask import Blueprint, Flask, request, jsonify
from flask_login import login_required, current_user
from app.models.note import Note
from app.models.notebook import Notebook
from app.models import db
from ..forms.note_creator import CreateNote
from ..forms.note_update import UpdateNote
# from app.models.notebook import Notebook
# from datetime import datetime

note_routes = Blueprint('notes', __name__)

@note_routes.route('/')
@login_required
def get_notes():
    """Get current user's notes with tags"""

    user_notes = Note.query.filter_by(user_id=current_user.id).all()
    notes_with_tags = [note.to_dict(include_tags=True) for note in user_notes]

    return jsonify(notes_with_tags), 200

@note_routes.route('/create', methods=['POST'])
@login_required
def post_note():
    """Create a new note"""

    form = CreateNote()

    form['csrf_token'].data = request.cookies['csrf_token']

    data = request.get_json()
    notebook_id = data.get('notebookId')
    print(f"Received data: {data}")
    print(f"Notebook ID: {notebook_id}")

    if form.validate_on_submit():
        new_note = Note(
            title=form.data['title'],
            content=form.data['content'],
            user_id=current_user.id,
            # notebook_id = notebook.id,
            # created_at = datetime.utcnow(),
            # updated_at = datetime.utcnow()
        )

        if notebook_id:
            notebook = Notebook.query.get(notebook_id)
            if notebook:
                print(f"Notebook found: {notebook}")
                new_note.notebooks.append(notebook)
            else:
                print("Notebook not found")
                return jsonify({"errors": "Notebook not found"}), 404

        db.session.add(new_note)
        db.session.commit()

        return jsonify({"message": "New note created", "note": new_note.to_dict()}), 201

    print("Form validation errors:", form.errors)
    return jsonify({"errors": form.errors}), 400

@note_routes.route('/<int:note_id>/edit', methods=['GET', 'PUT'])
@login_required
def update_note(note_id):
    """Update a note by ID"""

    note = Note.query.get(note_id)
    if note is None:
        return {'errors': {'message': 'Note not found'}}, 404
    if note.user_id != current_user.id:
        return {'errors': {'message': 'You are not authorized'}}, 403
    if request.method == 'GET':
        return note.to_dict()

    form = UpdateNote()
    form['csrf_token'].data = request.cookies['csrf_token']

    if form.validate_on_submit():
        note.title = form.data['title']
        note.content = form.data['content']
        db.session.commit()
        return note.to_dict()
    #might want to use else
    if form.errors:
        return {'errors': form.errors}, 400

    return "Successful edit!" #never hit?

@note_routes.route('/<int:note_id>/delete', methods=['DELETE'])
@login_required
def delete_note(note_id):
    """Delete a note by ID"""

    print("Attempting to delete note with ID: {note.id}")

    note = Note.query.get(note_id)
    if note is None:
        print(f"Note with ID {note_id} not found")
        return {'errors': {'message': 'Note not found'}}, 404

    if note.user_id != current_user.id:
        print(f"User not authorized to delete note with ID {note_id}")
        return {'errors': {'message': 'You are not authorized'}}, 403

    db.session.delete(note)
    db.session.commit()
    return {'message': 'Note successfully delted'}

@note_routes.route('/<int:note_id>', methods=['PUT'])
def update_note_id(note_id):
    data = request.get_json()
    notebook_id = data.get('notebook_id')

    note = Note.query.get(note_id)
    if not note:
        return jsonify({"error": "Note not found"}), 404

    note.notebook_id = notebook_id
    db.session.commit()

    return jsonify(note.to_dict())

@note_routes.route('/<int:note_id>/notebooks/<int:notebook_id>/remove', methods=['DELETE'])
@login_required
def remove_note_from_notebook(note_id, notebook_id):
    """Remove a note from a notebook"""
    note = Note.query.get(note_id)
    notebook = Notebook.query.get(notebook_id)

    if not note or not notebook:
        return jsonify({'error': 'Notebook or note not found'}), 404

    if note in notebook.notes:
        notebook.notes.remove(note)
        db.session.commit()

    return jsonify({'message': 'Note removed from notebook'})
