import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';
import Loader from './components/loader/Loader'
import StatementQuerier from './components/statement-querier/StatementQuerier';

const App = () => {

    const [itemQ, setItemQ] = useState(935)
    const [data, setData] = useState([])
    const [currentItem, setcurrentItem] = useState({ name: '', description: '', also_known_as: [] })
    const [loading, setLoading] = useState(false)
    const inputRef = useRef(null)

    useEffect(() => { inputRef.current.focus() }, [])

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
            let also_known_as = []
            for (const item of res.data.results.bindings) {
                let prop = item.property.value;
                let val = item.property_value_Label.value;
                if (prop === '__Name__') { name = val }
                else if (prop === '__Description__') { description = val }
                else if (prop === '__AlsoKnownAs__') { also_known_as.push(val) }
                else { break }
            }
            setcurrentItem({ name: name, description: description, also_known_as: also_known_as })

        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="App">
            <div className="App-header"><p>Wikidata refs</p></div>
            <div className="main-content">
                <div className="title">Search Wikidata item by Identifier</div>
                <div className="search-box">
                    <div className="Q">Q</div>
                    <input ref={inputRef} onChange={(e) => setItemQ(e.target.value)} className="q-input" />
                </div>
                <button onClick={() => queryFlask()} className="search-button">Search</button>

                <div className="info-box">
                    <div className="item-text-box"><div className="item-text"> Item Name:  </div> {currentItem.name} </div>
                    <div className="item-text-box"><div className="item-text"> Description:</div> {currentItem.description} </div>
                </div>

                {
                    (loading === true ? <Loader /> :
                        (data.length === 0 ? '' :
                            <div className="table-wrapper">
                                <div className="statements-title">Statements</div>
                                
                                {
                                    data.map((entry, index) => {
                                        // Filter some
                                        if (['__Name__', '__AlsoKnownAs__', '__Description__'].includes(entry.property.value)) { return null }
                                        if (entry.property_value_Label.value.includes('http://commons.wikimedia.org/')) { return null }

                                        let property        = entry.property.value
                                        let property_number = entry.propNumber.value
                                        let value           = entry.property_value_Label.value
                                        let value_url       = entry.property_value_
                                        let references      = entry.references.value

                                        return <StatementQuerier
                                            key={index}
                                            name={currentItem.name}
                                            also_known_as={currentItem.also_known_as}
                                            property={property}
                                            property_number={property_number}
                                            value={value}
                                            value_url={value_url}
                                            references={references}
                                        />
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
