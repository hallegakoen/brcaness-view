import React, { Component } from 'react';
import ScoreChart from './ScoreChart';

const cutoffScores = {
  HRD: 42,
  PARPi7: 1.03,
  RPS: '',
  LST: '',
  AI: '',
  LOH: ''
}

const sortCharts = function(scores) {
  const patientScores = scores;
  let keys = Object.keys(patientScores).sort(function(a,b) {
    if (patientScores[a] < cutoffScores[a] && patientScores[b] >= cutoffScores[b]) return 1;
    if (patientScores[a] >= cutoffScores[a] && patientScores[b] < cutoffScores[b]) return -1;
    else return 0;
  });
  return keys;
}

const getPanelColor = function(patientScores, score) {
  if (cutoffScores[score] === '') return 'info';
  if (patientScores[score] >= cutoffScores[score]) return 'danger';
  else return 'info';
}

class ScoreDisplay extends Component {
  render() {
    let keys = sortCharts(this.props.patientScores);
    let charts = [];
    for(let i=0; i<keys.length; i++){
      const k = keys[i];
      charts.push(
        <ScoreChart
          patientScore = {parseFloat(this.props.patientScores[k])}
          targetCancer = {this.props.targetCancer}
          scoreLabel = {k}
          scoreName = {k}
          cutoffScore = {cutoffScores[k]}
          panelColor = {getPanelColor(this.props.patientScores,k)}
          key = {k}
          queriedTarget = {this.props.queriedTarget}
          queriedRef = {this.props.queriedRef}
          patientSample = {this.props.patientSample}
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
