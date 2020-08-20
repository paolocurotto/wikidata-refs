import axios from 'axios';


const SOLR_URL = 'http://localhost:8983/solr/crawl_index/select';
//const SOLR_URL = 'http://localhost:8983/solr/ABCDE_core/select';


export async function get_solr_docs(name, property, value, Q, limitSearch, altLabelsData) {
    let docs = [];
    let status = false;

    const { altLabels, item_altLabels, prop_altLabels, val_altLabels } = altLabelsData;

    // Append alternative labels to query in case user asked
    let alt_labels_string = '';
    if (altLabels) {
        alt_labels_string += appendLabels(item_altLabels);
        alt_labels_string += appendLabels(prop_altLabels);
        alt_labels_string += appendLabels(val_altLabels);
    }

    // Append limit search to documents that appear in item's wikipedia page
    const limit_search = (limitSearch) ? (' AND Q:' + Q) : '';

    let data_to_query = `${name} ${property} ${alt_labels_string} ${value}`;

    // Fix to problematic charcaters
    data_to_query = data_to_query.replace(/:/g, '')

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

        for (let url of Object.keys(solr_res['data']['highlighting'])) {
            let doc = {};
            doc['url'] = url;
            doc['highlight'] = solr_res['data']['highlighting'][url]['content'][0];
            docs.push(doc);
        }
        status = true;

    } catch (error) {
        status = false;
    }

    return [docs, status];
}

function appendLabels(labels_arr) {
    return labels_arr.reduce((acc, label) => acc + label + ' ', '');
}