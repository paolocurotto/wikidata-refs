from flask import Blueprint, request
import requests

wikidata = Blueprint('wikidata', __name__)

@wikidata.route('/wikidata', methods=['GET'])
def wikidataGetItem():

    item = request.args.get('item')
    print('item: ' + item)
    url = "https://query.wikidata.org/sparql"
    query = """
    SELECT ?property ?property_value_Label ?reference {
  
    VALUES (?item) {(wd:Q""" + item + """)}  {	
		BIND("__Name__"@en AS ?property ) .
        ?item rdfs:label ?property_value_ .
        FILTER (LANG(?property_value_) = "en") 
	}

    UNION {   
        BIND("__AlsoKnownAs__"@en AS ?property ) .
        OPTIONAL { ?item skos:altLabel ?property_value_}.  
        FILTER (LANG(?property_value_) = "en") 
    }

    UNION {   
        BIND("__Description__"@en AS ?property ) .
        OPTIONAL {?item schema:description ?property_value_}.
        FILTER (LANG(?property_value_) = "en") 
    }
  
    UNION {
      ?item ?p ?statement .
      ?statement ?ps ?property_value_ .
      ?property_ rdf:type wikibase:Property .
      ?property_ wikibase:statementProperty ?ps.
      ?property_ rdfs:label ?property .
      FILTER (LANG(?property) = "en") 
  
    OPTIONAL {
      ?statement prov:wasDerivedFrom ?ref .
      ?ref pr:P854 ?reference .
    }
      
    BIND(SUBSTR(str(?p), 31, 250) AS ?propNumber)

    }
  
    SERVICE wikibase:label { bd:serviceParam wikibase:language "en" }
    } ORDER BY xsd:integer(?propNumber) ?property_ ?property_value_
    """

    headers = {'Accept': 'application/sparql-results+json'}
    results = requests.get(url, params = { 'format': 'json', 'query': query }, headers=headers)
    results = results.json()
    
    return results