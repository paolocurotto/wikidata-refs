import React, { useState } from 'react'
import axios from 'axios'
import './StatementQuerier.css'

const StatementQuerier = (props) => {

    const { name, also_known_as, property, property_number, value, references } = props;
    const { type, value: value_url } = props.value_url

    const [urls, setUrls] = useState({})
    const [results, setResults] = useState(false)
    const [searchedAltLabels, setSearchedAltLabels] = useState(false)
    const [searchingAltLabels, setSearchingAltLabels] = useState(false)
    const [propertyAltLabels, setPropertyAltLabels] = useState([])
    const [valueAltLabels, setValueAltLabels] = useState([])


    async function querySolr() {
        try {
            const res = await axios({
                method: 'post',
                url: '/solr/',
                data: {
                    name: name,
                    property: property,
                    value: value
                },
                headers: { 'Content-Type': 'application/json' },
            })

            setUrls(res.data)
            setResults(true)

        } catch (error) {
            console.log(error)
        }
    }

    async function searchSimilarTerms(e) {
        if (!e.target.checked) { return }
        if (searchedAltLabels || searchingAltLabels) { return }
        setSearchingAltLabels(true)

        try {
            const res = await axios({
                method: 'post',
                url: '/wikidata/search_terms',
                data: {
                    prop_number: property_number,
                    val_type: type,
                    val_url: value_url,
                },
                headers: { 'Content-Type': 'application/json' },
            })

            //console.log(res)
            setPropertyAltLabels(res.data.prop_alt_labels)
            setValueAltLabels(res.data.value_alt_labels)
            setSearchedAltLabels(true)
        } catch (error) {
            console.log(error)
        } finally {
            setSearchingAltLabels(false)
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

                    {
                        !searchedAltLabels ? '' : (
                            <div>
                                <div><span style={{ color: '#777' }}>{name}    </span> ->  {also_known_as.map(l => l + ', ')} </div>
                                <div><span style={{ color: '#777' }}>{property}</span> ->  {propertyAltLabels.map(l => l + ', ')} </div>
                                <div><span style={{ color: '#777' }}>{value}   </span> ->  {valueAltLabels.map(l => l + ', ')} </div>
                            </div>
                        )
                    }

                </div>

                <div className="statement-search-box">
                    <label className="search-checkbox" ><input type="checkbox" />Search only URLs that appear in Q wikipedia Page</label>
                    <label className="search-checkbox" ><input onClick={searchSimilarTerms} type="checkbox" />Search using similar terms</label>
                    <div style={{display: 'flex'}}><button style={{padding: '5px'}} onClick={querySolr}>Search References</button></div>

                </div>

            </div>

            {
                (!results) ? '' : (
                    <div className="statement-results">
                        {
                            urls.response.docs.map(({ url }, index) => {
                                let c = (urls.response.docs.length - 1 === index) ? '' : 'statement-highlight'
                                return (
                                    <div className={c} key={index}>
                                        <a href={url}>{url}</a>
                                        <p dangerouslySetInnerHTML={{ __html: urls.highlighting[url].content[0] }} />
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

export default StatementQuerier