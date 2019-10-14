import React, { useState } from 'react'
import './StatementQuerier.css'
import LoaderSmall from '../loader/LoaderSmall';
import { get_solr_docs, get_similar_terms } from '../../queries'


const StatementQuerier = (props) => {

    const { Q, name, also_known_as = [], property, property_number, value, references } = props;
    const { type, value: value_url } = props.value_url

    const [docs, setDocs] = useState('')
    const [searchedAltLabels, setSearchedAltLabels] = useState(false)
    const [searchingAltLabels, setSearchingAltLabels] = useState(false)
    const [propertyAltLabels, setPropertyAltLabels] = useState([])
    const [valueAltLabels, setValueAltLabels] = useState([])
    const [limitToItemUrls, setLimitToItemUrls] = useState(false)
    const [searchWithAltLabels, setSearchWithAltLabels] = useState(false)

    async function querySolr() {
        const altLabels_data = { altLabels: searchWithAltLabels, prop_altLabels: propertyAltLabels }
        const [docs, status] = await get_solr_docs(name, property, value, Q, limitToItemUrls, altLabels_data)
        setDocs(docs)
        if (!status) {
            console.log('Error getting documents from solr')
        }
    }

    async function searchSimilarTerms(e) {
        setSearchWithAltLabels(e.target.checked)
        if (!e.target.checked) { return }
        if (searchedAltLabels || searchingAltLabels) { return }
        setSearchingAltLabels(true)
        const [prop_alt_labels, value_alt_labels, status] = await get_similar_terms(property_number, type, value_url)
        setSearchingAltLabels(false)
        setPropertyAltLabels(prop_alt_labels)
        setValueAltLabels(value_alt_labels)
        if (!status) {
            console.log('Error getting alternative labels')
        }
        else {
            setSearchedAltLabels(true)
        }
    }

    const referenceIcon = (references === '') ? <i className="cross material-icons">clear</i> : <i className="check material-icons">done</i>

    return (
        <div className="statement-wrapper">
            <div className="statement-box">
                <div className='statement-info-box'>
                    <div className='statement-text-box'>
                        <span className="statement-text"> Property: </span>
                        <span className="statement-value"> {property} </span>
                    </div>
                    <div className='statement-text-box'>
                        <span className="statement-text"> Value: </span>
                        <span className="statement-value"> {value} </span>
                    </div>
                    <div className='statement-text-box'>
                        <span className="statement-text"> Has external reference? </span>
                        <span className="statement-value"> {referenceIcon} </span>
                    </div>
                </div>

                <div className="statement-search-box">

                    <div className="checkbox-container">
                        <label className="search-checkbox" >
                            <input type="checkbox" onChange={(e) => { setLimitToItemUrls(e.target.checked) }} />
                            <span className="checkmark"></span>
                            Search only URLs that appear in Q wikipedia Page
                        </label>
                    </div>

                    <div className="checkbox-container">
                        <label className="search-checkbox" >
                            <input type="checkbox" onClick={searchSimilarTerms} />
                            <span className="checkmark"></span>
                            <div style={{ marginRight: '10px' }}>Search using similar terms</div>
                        </label>
                        {searchingAltLabels ? <LoaderSmall /> : searchedAltLabels ? <i className="check material-icons">done</i> : ''}
                    </div>

                    <div className="search-button-container"><button className="search-button" onClick={querySolr}>Search References</button></div>
                </div>

            </div>

            {
                (docs === '') ? '' : (docs.length === 0) ?
                    <div className="no-results-box">No results found</div> : (
                        <div className="statement-results">
                            {
                                docs.map((doc, index) => {
                                    let c = (docs.length - 1 === index) ? '' : 'statement-highlight'
                                    return (
                                        <div className={c} key={index}>
                                            <a href={doc.url}>{doc.url}</a>
                                            <p className="highlight-text" dangerouslySetInnerHTML={{ __html: doc.highlight }} />
                                        </div>
                                    )
                                })
                            }
                        </div>
                    )
            }
        </div>
    )
}

export default React.memo(StatementQuerier)