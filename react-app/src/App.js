import React, { useState } from 'react';
import axios from 'axios';
import './App.css';
import Loader from './components/loader/Loader'

const App = () => {

    const [itemQ, setItemQ] = useState(25)
    const [data, setData] = useState([])
    const [currentItem, setcurrentItem] = useState({ name: '', description: '' })
    const [loading, setLoading] = useState(false)

    async function queryFlask() {
        try {
            setLoading(true)
            setcurrentItem({ name: '', description: '' })
            const res = await axios({
                method: 'get',
                url: '/wikidata',
                params: { item: itemQ },
            })

            setData(res.data.results.bindings)
            let name = ''
            let description = ''
            for (const item of res.data.results.bindings) {
                if (item.property.value === '__Name__') { name = item.property_value_Label.value }
                if (item.property.value === '__Description__') { description = item.property_value_Label.value }
                if (name !== '' && description !== '') { break }
            }
            setcurrentItem({ name: name, description: description })

        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    async function querySolr(property, value) {
        try {
            const res = await axios({
                method: 'post',
                url: '/solr/',
                data: {
                    name: currentItem.name,
                    property: property,
                    value: value
                },
                headers: { 'Content-Type': 'application/json' },
            })

            console.log(res)

        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div className="App">
            <div className="App-header"><p>Wikidata refs</p></div>
            <div className="main-content">
                <div className="search-box">
                    <input onChange={(e) => setItemQ(e.target.value)} className="q-input" />
                </div>
                <button onClick={() => queryFlask()} className="search-button">Search</button>

                <div className="info-box">
                    <p>Item Name: {currentItem.name} </p>
                    <p>Description: {currentItem.description} </p>
                </div>

                {
                    (loading === true ? <Loader /> : 
                        (data.length === 0 ? '' :
                            <div className="table-wrapper">
                                <div className="header row">
                                    <div className="c1 cell">Property</div>
                                    <div className="c2 cell">Value</div>
                                    <div className="c3 cell">Reference?</div>
                                </div>

                                {
                                    data.map((entry, index) => {
                                        return (
                                            <div className="row" key={index}>
                                                <div className="c1 cell"> {index + '. ' + entry.property.value} </div>
                                                <div className="c2 cell"> {entry.property_value_Label.value} </div>
                                                <div className="c3 cell"> {(entry.reference ? (<i className="done material-icons">done</i>) :
                                                    <button
                                                        onClick={() => querySolr(entry.property.value, entry.property_value_Label.value)}
                                                        className="query-solr-button">Query Solr</button>
                                                )} </div>
                                            </div>
                                        )
                                    })
                                }

                            </div>
                        )
                    )
                }

            </div>
        </div>
    );
}

export default App;
