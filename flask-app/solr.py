from flask import Blueprint, request
import requests

solr = Blueprint('solr', __name__)

@solr.route('/solr/', methods=['POST'])
def solrQueryDocument():

    print('RECIEVED POST')
    data = request.get_json()
    print(data)

    name     = data['name']
    property = data['property']
    value    = data['value']

    print(name)
    print(property)
    print(value)


    results = requests.get(
        'http://localhost:8983/solr/ABCDE_core/select', 
        params = { 
            'fl': 'url, Q',
            'hl.fl': 'content',
            'hl': 'on',
            'q': 'content:(' + name + ' ' + property + ' ' + value + ')',
            'rows': '3',
        }
    )
    results = results.json()

    print(results)
    
    return results