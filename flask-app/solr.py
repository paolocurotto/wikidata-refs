from flask import Blueprint, request
import requests

solr = Blueprint('solr', __name__)

@solr.route('/solr/', methods=['POST'])
def solrQueryDocument():

    data = request.get_json()
    print(data)

    name            = data['name']
    property        = data['property']
    value           = data['value']
    Q               = data['Q']
    limitToItemUrls = data['limitToItemUrls']
    
    limit_search = (' AND Q:'+Q) if limitToItemUrls else ''

    results = requests.get(
        'http://localhost:8983/solr/ABCDE_core/select', 
        params = { 
            'fl': 'url, Q',
            'hl.fl': 'content',
            'hl': 'on',
            'q': 'content:(' + name + ' ' + property + ' ' + value + ')' + limit_search,
            'rows': '3',
        }
    )
    results = results.json()    
    return results