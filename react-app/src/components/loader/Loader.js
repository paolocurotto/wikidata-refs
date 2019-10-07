import React from 'react'
import './Loader.css'

const Loader = () => {

    return (
        <div className="loader-circle">
            <svg viewBox="22 22 44 44">
                <circle className="loader-dash" cx="44" cy="44" r="20.2" fill="none" strokeWidth="3.6">
                </circle>
            </svg>
        </div>
    )

}

export default Loader