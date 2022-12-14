from flask import Flask
from flask_cors import CORS
from config import Configuration

app = Flask(__name__)
CORS(app, origins=[Configuration.FLASK_ORIGIN])

from core import views