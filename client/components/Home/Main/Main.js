import React from 'react';
import RaisedButton from 'material-ui/RaisedButton'
import feedPileHigh from '../../../images/feedpile-high.png'
import './Main.css'

const Main = (props) => {
  return (
    <div className="main-container">
      <div className="image-title-container" >
        <img className="main-image" src={feedPileHigh}/>
        <h1 className="title">Feedpile</h1>
      </div>
      <div className="tagline-container">
        <h1 className="tagline">All your favorite news feeds, piled high</h1>
      </div>
      <div className='start-btn'>
        <RaisedButton label="Get Started" primary={true} />
      </div>
    </div>
  )
}

export default Main;
