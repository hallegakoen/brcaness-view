import React, { Component } from 'react';
import ScoreChart from './ScoreChart';

const cutoffScores = {
  hrd: 42,
  parpi7: 1.03
}

const sortCharts = function(scores) {
  const patientScores = scores;
  let keys = Object.keys(patientScores).sort(function(a,b) {
    debugger;
    if (patientScores[a] < cutoffScores[a] && patientScores[b] >= cutoffScores[b]) return 1;
    if (patientScores[a] >= cutoffScores[a] && patientScores[b] < cutoffScores[b]) return -1;
    else return 0;
  });
  return keys;
}

class ScoreDisplay extends Component {
  render() {
    let keys = sortCharts(this.props.patientScores);
    let charts = [];
    for(let i=0; i<keys.length; i++){
      const k = keys[i];
      charts.push(<ScoreChart
        patientScore = {parseFloat(this.props.patientScores[k])}
        targetCancer = {this.props.targetCancer}
        scoreLabel = {k}
        scoreName = {k}
        cutoffScore = {cutoffScores[k]}
        key = {k}/>);
    }

    return(
      <div>
        {charts}
      </div>
    );
  }
}

export default ScoreDisplay;
