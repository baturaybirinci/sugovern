import React from 'react';

const Popup = (props) => {
    return (props.trigger) ? (
            <div className='popup'>
                <div className='popup-inner'>
                    <button className='close-btn' onClick={() => {props.setTrigger(false); if(props.setLockScreen !== undefined) {props.setLockScreen(false)}}}>close</button>
                    {props.children}
                </div>
            </div>
        )
        :"";
}

export default Popup