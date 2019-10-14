from flask import Blueprint, request
import requests
import pprint
import re

solr = Blueprint('solr', __name__)

@solr.route('/solr/', methods=['POST'])
def solrQueryDocument():

    data = request.get_json()
    #print(data)

    name            = data['name']
    property        = data['property']
    value           = data['value']
    Q               = data['Q']
    limitToItemUrls = data['limitToItemUrls']
    altLabels       = data['altLabelsData']['altLabels']
    prop_AltLabels  = data['altLabelsData']['prop_altLabels']

    
    # Append alternative labels to query in case user asked
    alt_labels_string = ' '
    if (altLabels): 
        for label in prop_AltLabels:
            alt_labels_string = alt_labels_string + label + ' '        

    # Append limit search to documents that appear in item wikipedia page
    limit_search = (' AND Q:'+Q) if limitToItemUrls else ''

    data_to_query = name + ' ' + property + ' ' + alt_labels_string + ' ' + value
    
    # Fix: Delete other problematic characters too
    data_to_query = data_to_query.replace(':', '')

    results = requests.get(
        'http://192.168.18.104:8983/solr/ABCDE_core/select', 
        params = { 
            'fl': 'url, Q',
            'hl.fl': 'content',
            'hl': 'on',
            #'q': 'content:(' + name + ' ' + property + ' ' + alt_labels_string + ' ' + value + ')' + limit_search,
            'q': 'content:(' + data_to_query + ')' + limit_search,
            'rows': '3',
        }
    )
    results = results.json()
    data = []
    for url in results['highlighting']:
        doc = {}
        doc['url'] = url
        doc['highlight'] = results['highlighting'][url]['content'][0]
        data.append(doc)

    return { 'docs': data }