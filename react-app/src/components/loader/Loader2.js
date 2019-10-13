import React from 'react'
import './Loader2.css'

const Loader2 = () => {

    return (
        <div className="spinner">
        <div id="spinnerContainer" className="active ">
            <div className="spinner-layer">
                <div className="circle-clipper left">
                    <div className="circle">
                    </div>
                </div>
                <div className="circle-clipper right">
                    <div className="circle">
                    </div>
                </div>
            </div>
        </div>
        </div>
    )

}

export default Loader2