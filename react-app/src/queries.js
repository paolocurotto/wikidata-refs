import axios from 'axios';


export async function get_wikidata_item(item_number) {
    let name = ''
    let description = ''
    let also_known_as = []
    let statements = []
    let status = false 
    try {
        const res = await axios({
            method: 'get',
            url: '/wikidata',
            params: { item: item_number },
        })
        statements = res.data.results.bindings
        status = true
        for (const item of res.data.results.bindings) {
            let prop = item.property.value;
            let val = item.property_value_Label.value;
            if      (prop === '__Name__')        { name = val }
            else if (prop === '__Description__') { description = val }
            else if (prop === '__AlsoKnownAs__') { also_known_as.push(val) }
            else { break }
        }
    } catch (error) { status = false }
    return [name, description, also_known_as, statements, status];
}


export async function get_solr_docs(name, property, value, Q, limitSearch, altLabelsData) {
    let docs = []
    let status = false
    try {
        const res = await axios({
            method: 'post',
            url: '/solr/',
            data: {
                name: name,
                property: property,
                value: value,
                Q: Q,
                limitToItemUrls: limitSearch,
                altLabelsData: altLabelsData,
            },
            headers: { 'Content-Type': 'application/json' },
        })
        docs = res.data.docs
        status = true
    } catch (error) { status = false }
    return [docs, status] 
}


export async function get_similar_terms(property_number, type, value_url) {
    let prop_alt_labels = []
    let value_alt_labels = []
    let status = false
    try {
        const res = await axios({
            method: 'post',
            url: '/wikidata/search_similar_terms',
            data: {
                prop_number: property_number,
                val_type: type,
                val_url: value_url,
            },
            headers: { 'Content-Type': 'application/json' },
        })
        status = true
        prop_alt_labels = res.data.prop_alt_labels
        value_alt_labels = res.data.value_alt_labels
    } catch (error) { status = false }
    return [prop_alt_labels, value_alt_labels, status]
}
