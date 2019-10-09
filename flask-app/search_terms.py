from flask import Blueprint, request
import requests

search_terms = Blueprint('search_terms', __name__)

@search_terms.route('/wikidata/search_terms', methods=['POST'])
def wikidata_search_similar_terms():

    data = request.get_json()

    prop_num = data['prop_number']
    val_type = data['val_type']
    val_url  = data['val_url']
    value_query = ''

    # In case the value is an iri and thus has alt labels search them too
    if (val_type == 'uri'):
        val_num = val_url[32:]
        value_query = """ 
            UNION {
                BIND("value"@en AS ?item ) .
                OPTIONAL { 
                    wd:Q""" + val_num + """ skos:altLabel ?also_known_as .
                    FILTER (LANG(?also_known_as) = "en") 
                }  
            } 
        """


    url = "https://query.wikidata.org/sparql"
    query = """
    SELECT ?item ?also_known_as {
        {
            BIND("property"@en AS ?item ) .
            OPTIONAL { 
                wd:P""" + prop_num + """ skos:altLabel ?also_known_as .
                FILTER (LANG(?also_known_as) = "en") 
            }  
        }
        """ + value_query + """
    }
    """

    headers = {'Accept': 'application/sparql-results+json'}
    results = requests.get(url, params = { 'format': 'json', 'query': query }, headers=headers)
    results = results.json()

    #print(results)

    #return results

    
    response_data = {
        'prop_alt_labels': [],
        'value_alt_labels': [],
    }

    for row in results['results']['bindings']:
        try:
            item  = row['item']['value']
            label = row['also_known_as']['value']
        except:
            continue
        
        if (item == 'property'):
            response_data['prop_alt_labels'].append(label)

        if (item == 'value'):
            response_data['value_alt_labels'].append(label)


    return response_data
    