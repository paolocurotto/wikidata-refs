import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';
import Loader from './components/loader/Loader'
import StatementQuerier from './components/statement-querier/StatementQuerier';
import Loader2 from './components/loader/Loader2';

const App = () => {
    const [itemQInput, setItemQInput] = useState('')
    const [itemQ, setItemQ] = useState('')
    const [data, setData] = useState([])
    const [currentItem, setcurrentItem] = useState({ name: '', description: '', also_known_as: [] })
    const [loading, setLoading] = useState(false)
    const [searched, setSearched] = useState(false)
    const inputRef = useRef(null)

    useEffect(() => { inputRef.current.focus() }, [])

    async function queryFlask() {
        setLoading(true)
        setSearched(true)
        setcurrentItem({ name: '', description: '' })
        setItemQ(itemQInput)
        try {
            const res = await axios({
                method: 'get',
                url: '/wikidata',
                params: { item: itemQInput },
            })
            console.log('fetched')
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

    const noItemFound = (<div className="no-item-found">No item found</div>)

    console.log('re-render')

    return (
        <div className="App">
            <div className="App-header"><p>Wikidata refs</p></div>

            <Loader2 />

            <div className="main-content">
                <div className="title">Search Wikidata item by Identifier</div>
                <div className="search-box">
                    <div className="Q">Q</div>
                    <input value={itemQInput} ref={inputRef} onChange={(e) => setItemQInput(e.target.value.replace(/\D/,''))} className="q-input" />
                </div>
                <button onClick={queryFlask} className="search-statements-button">Search</button>


                {
                    (loading === true ? <Loader /> :
                        (data.length === 0 ? !searched ? '' : noItemFound :

                            <>
                                <div className="info-box">
                                    <div className="item-text-box"><div className="item-text"> Item Name:  </div> {currentItem.name} </div>
                                    <div className="item-text-box"><div className="item-text"> Description:</div> {currentItem.description} </div>
                                </div>

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
                                            Q={itemQ}
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
                            </>
                        )
                    )
                }
            </div>
        </div>
    );
}

export default App;
