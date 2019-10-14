from flask import Flask

from wikidata import wikidata
from solr import solr
from search_similar_terms import search_similar_terms

app = Flask(__name__)

app.register_blueprint(wikidata)
app.register_blueprint(solr)
app.register_blueprint(search_similar_terms)


@app.route('/')
def hello_world():
    return 'Hello, World.'


if __name__ == '__main__':
    app.run(debug=True)