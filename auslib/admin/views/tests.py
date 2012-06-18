from flask import render_template
from flask.views import MethodView

__all__ = ["TestsView"]

class TestsView(MethodView):
    """/tests"""
    def get(self):
        return render_template("tests.html")
