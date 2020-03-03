const axios = require('axios');
const express = require('express');
const router = express.Router();


const SOLR_URL = 'http://localhost:8983/solr/crawl_index/select';

router.post('/solr', async (req, res) => {

    const { name, property, value, Q, limitToItemUrls } = req.body;
    const { altLabels, item_altLabels, prop_altLabels, val_altLabels } = req.body['altLabelsData'];

    console.log('SOLR');
    console.log(req.body);

    // Append alternative labels to query in case user asked
    let alt_labels_string = '';
    if (altLabels) {
        alt_labels_string += appendLabels(item_altLabels);
        alt_labels_string += appendLabels(prop_altLabels);
        alt_labels_string += appendLabels(val_altLabels );
    }

    // Append limit search to documents that appear in item wikipedia page
    const limit_search = (limitToItemUrls) ? (' AND Q:'+Q)  : '';

    let data_to_query = `${name} ${property} ${alt_labels_string} ${value}`;

    // Fix to problematic charcaters
    data_to_query = data_to_query.replace(':', '')

    try {
        const solr_res = await axios({
            method: 'get',
            url: SOLR_URL,
            params: { 
                'fl': 'url, Q',
                'hl': 'on',
                'hl.method': 'unified',
                'hl.fl': 'content',
                'q': 'content:(' + data_to_query + ')' + limit_search,
                'rows': '3',
            },
        });

        const docs = [];
        for (let url of Object.keys(solr_res['data']['highlighting'])) {
            doc = {};
            doc['url'] = url;
            doc['highlight'] = solr_res['data']['highlighting'][url]['content'][0];
            docs.push(doc);
        }

        res.json({ 'docs': docs });
    }
    catch (error) {
        console.log(error);
        res.send({ error_msg: error })
    }

});


function appendLabels(labels_arr) {
    return labels_arr.reduce((acc, label) => acc + label + ' ', '');
}



module.exports = router;