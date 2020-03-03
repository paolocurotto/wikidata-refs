const axios = require('axios');
const express = require('express');
const router = express.Router();


const WIKIDATA_URL = 'https://query.wikidata.org/sparql';


router.post('/wikidata/search_similar_terms', async (req, res) => {

    const { prop_number, val_type, val_url } = req.body;

    let value_query = createValueSubQuery(val_type, val_url);
    const query = createQuery(prop_number, value_query);

    try {
        const wikidata_res = await axios({
            method: 'get',
            url: WIKIDATA_URL,
            headers: { 'Accept': 'application/sparql-results+json' },
            params: { 'format': 'json', 'query': query },
        });

        const response_data = createResponseData(wikidata_res);
        console.log(response_data);
        res.json(response_data);
    }
    catch (error) {
        console.log(error);
        res.send({ error_msg: error })
    }
});


function createValueSubQuery(type, url) {
    if (type !== 'uri') {
        return '';
    }
    const value_identifier = url.slice(32);
    return `UNION {
        BIND("value"@en AS ?item ) .
        OPTIONAL { 
            wd:Q${value_identifier} skos:altLabel ?also_known_as .
            FILTER (LANG(?also_known_as) = "en") 
        }  
    }`
}

function createQuery(property_number, value_sub_query) {
    return `SELECT ?item ?also_known_as {
        {
            BIND("property"@en AS ?item ) .
            OPTIONAL { 
                wd:P${property_number} skos:altLabel ?also_known_as .
                FILTER (LANG(?also_known_as) = "en") 
            }  
        }
        ${value_sub_query} 
    }`
}

function createResponseData(wikidata_data) {
    const response_data = {
        prop_alt_labels: [],
        value_alt_labels: [],
    }

    for (let row of wikidata_data['data']['results']['bindings']) {
        try {
            const item = row['item']['value'];
            const label = row['also_known_as']['value'];
            
            if (label === undefined) { continue }

            if (item === 'property') {
                response_data['prop_alt_labels'].push(label);
            }
            if (item === 'value') {
                response_data['value_alt_labels'].push(label);
            }
        } catch (err) {
            continue;
        }
    }

    return response_data;
}



module.exports = router;