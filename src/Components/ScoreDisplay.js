import React, { Component } from 'react';
import ScoreChart from './ScoreChart';


class ScoreDisplay extends Component {
  render() {
    let scores = this.props.patientScores;
    let scoreList = Object.keys(scores)
    let charts = [];
    for(let i=0; i<scoreList.length; i++) {
        let scoreName = scoreList[i];
        charts.push(
          <ScoreChart
            patientScore = {parseFloat(scores[scoreName])}
            targetCancer = {this.props.targetCancer}
            scoreName = {scoreName}
            key = {i}
            patientSample = {this.props.sample}
            filters = {this.props.filters}
            subtypeSelected = {this.props.subtypeSelected}
          />
        );
    }

    return(
      <div>
        {charts}
      </div>
    );
  }
}

export default ScoreDisplay;
