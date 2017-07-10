import React, { Component } from 'react';
import ScoreChart from './ScoreChart';

class ScoreDisplay extends Component {
  render() {
    let charts = Object.keys(this.props.patientScores).map(score =>
      (this.props.patientScores[score] === '') ?
      null:
      <ScoreChart
        patientScore = {parseFloat(this.props.patientScores[score])}
        targetCancer = {this.props.targetCancer}
        scoreLabel = {score}
        scoreName = {score}
        key = {score}/>
    );

    return(
      <div>
        {charts}
      </div>
    );
  }
}

export default ScoreDisplay;
