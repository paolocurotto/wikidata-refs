const axios = require('axios');
const express = require('express');
const router = express.Router();


const WIKIDATA_URL = 'https://query.wikidata.org/sparql';

router.get('/wikidata', async (req, res) => {

    const item_identifier = req.query.item;
    try {
        const wikidata_res = await axios({
            method: 'get',
            url: WIKIDATA_URL,
            headers: { 'Accept': 'application/sparql-results+json' },
            params: { 'format': 'json', 'query': query(item_identifier) },
        });

        //console.log(res);
        const parsed_results = parseResults(wikidata_res.data.results.bindings);
        res.json(parsed_results);
    }
    catch (error) {
        res.send({ error_msg: error })
    }
});


function query(item) {
    return `SELECT ?propNumber ?property ?property_value_Label ?property_value_ (GROUP_CONCAT (DISTINCT ?reference; SEPARATOR=", ") AS ?references) {
        VALUES (?item) {(wd:Q${item})}  {
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
      }
      GROUP BY ?propNumber ?property ?property_value_Label ?property_value_
      ORDER BY xsd:integer(?propNumber) ?property_ ?property_value_`
}

function parseResults(arr_of_results) {
    const parsed_results = { 'results': { 'bindings': [] } };
    for (let result of arr_of_results) {
        const value = result['property_value_Label']['value'];
        if (isValueADate(value)) {
            const [day, month, year] = getDayMonthYear(value);
            result['property_value_Label']['value'] = day + ' ' + month + ' ' + year;
        }
        parsed_results['results']['bindings'].push(result);
    }
    return parsed_results;
}

function isValueADate(val) {
    return val.charAt(4) === '-' && val.charAt(7) === '-' && val.charAt(10) === 'T' && val.charAt(13) === ':' && val.charAt(16) === ':' && val.charAt(19) === 'Z';
}

function getDayMonthYear(date) {
    let day   = date.substring(8, 10);
    let month = date.substring(5, 7);
    let year  = date.substring(0, 4);

    if (day[0] === '0') {
        day = day.substring(1, 2);
    }
    const months = {
        '01': 'January',
        '02': 'February',
        '03': 'March',
        '04': 'April',
        '05': 'May',
        '06': 'June',
        '07': 'July',
        '08': 'August',
        '09': 'September',
        '10': 'October',
        '11': 'November',
        '12': 'December',
    }

    if (months.hasOwnProperty(month)) {
        month = months[month];
    }
    
    return [day, month, year];
}


module.exports = router;