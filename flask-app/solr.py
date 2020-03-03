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
    item_AltLabels  = data['altLabelsData']['item_altLabels']
    prop_AltLabels  = data['altLabelsData']['prop_altLabels']
    val_AltLabels   = data['altLabelsData']['val_altLabels']

    using_3_values = True

    # Append alternative labels to query in case user asked
    alt_labels_string = ' '
    if (altLabels):

        if (using_3_values):
            for label in item_AltLabels:
                alt_labels_string = alt_labels_string + label + ' '
        
        for label in prop_AltLabels:
            alt_labels_string = alt_labels_string + label + ' ' 
        
        if (using_3_values):
            for label in val_AltLabels:
                alt_labels_string = alt_labels_string + label + ' '        

    # Append limit search to documents that appear in item wikipedia page
    limit_search = (' AND Q:'+Q) if limitToItemUrls else ''

    data_to_query = name + ' ' + property + ' ' + alt_labels_string + ' ' + value
    
    # Fix: There might be other problematic characters
    data_to_query = data_to_query.replace(':', '')

    results = requests.get(
        'http://localhost:8983/solr/crawl_index/select', 
        params = { 
            'fl': 'url, Q',
            'hl': 'on',
            'hl.method': 'unified',
            'hl.fl': 'content',
            #'hl.fragsize': '100',
            #'q': 'content:(' + name + ' ' + property + ' ' + alt_labels_string + ' ' + value + ')' + limit_search,
            'q': 'content:(' + data_to_query + ')' + limit_search,
            'rows': '5',
        }
    )
    results = results.json()
    docs = []
    for url in results['highlighting']:
        doc = {}
        doc['url'] = url
        doc['highlight'] = results['highlighting'][url]['content'][0]
        docs.append(doc)

    return { 'docs': docs }