from flask import Flask

from wikidata import wikidata
from solr import solr

app = Flask(__name__)

app.register_blueprint(wikidata)
app.register_blueprint(solr)

@app.route('/')
def hello_world():
    return 'Hello, All!'


if __name__ == '__main__':
    app.run(debug=True)