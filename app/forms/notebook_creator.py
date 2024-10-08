from flask_wtf import FlaskForm
from wtforms import StringField, DateField
from wtforms.validators import DataRequired, Length, ValidationError
from app.models import Notebook

def title_exists(form, field):
    title = field.data
    notebook = Notebook.query.filter(Notebook.title == title).first()
    if notebook:
        raise ValidationError('Notebook title is already in use.')

class CreateNotebook(FlaskForm):
    title = StringField('title', validators=[DataRequired(), Length(min=2, max=50, message='Title must be between 2 and 50 characters'), title_exists])
