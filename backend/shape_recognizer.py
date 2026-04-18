"""
Shape Recognizer — minimal stub so the translator can import it.
Full shape recognition can be added later.
"""


def recognize_shape(points):
    """Try to recognize a drawn shape. Returns (shape_name, confidence) or (None, 0)."""
    return None, 0.0


def save_template(shape_name, points):
    """Save a shape template for future recognition."""
    return True


def get_template_counts():
    """Return a dict of shape_name -> sample count."""
    return {}


def delete_templates(shape_name=None):
    """Delete templates. If shape_name is None, delete all."""
    pass
