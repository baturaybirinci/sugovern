import React from 'react'

const DeleteDAO = ({onDeleteDAO}) => {
  return (
    <div className='row'>
        <div className='col-12'>
            <br/><br/>
            <div className='d-flex justify-content-center'>
                <button className='btn btn-dark text-light' onClick={() => {onDeleteDAO()}}>
                    DeleteDAO
                </button>
            </div>
        </div>
    </div>
  )
}

export default DeleteDAO