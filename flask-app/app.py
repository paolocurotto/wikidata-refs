from flask import Flask

from wikidata import wikidata
from solr import solr
from search_terms import search_terms

app = Flask(__name__)

app.register_blueprint(wikidata)
app.register_blueprint(solr)
app.register_blueprint(search_terms)


@app.route('/')
def hello_world():
    return 'Hello, All!'


if __name__ == '__main__':
    app.run(debug=True)