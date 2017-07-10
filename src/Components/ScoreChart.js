import {Panel} from 'react-bootstrap';
import React, {Component} from 'react';
import tcgaData from './tcgaData.json';
import {VictoryBar, VictoryAxis, VictoryChart, VictoryLine, VictoryLabel} from 'victory';

//get array of scores from tcgaData.json
const getCancerScores = function(cancer, score) {
  const cancerData = tcgaData.filter(function(e) {return e.cancer === cancer});
  const cancerScores = cancerData.map((e) => e[score]);
  return cancerScores;
}

//bin array for VictoryBar
const getChartData = function(cancer, refCancer, score) {
  //rewrite minscore and binwidth
    const targetScores = getCancerScores(cancer, score);
    const refScores = getCancerScores(refCancer, score);
    const minTargetScore = Math.min.apply(null, targetScores);
    const minRefScore = Math.min.apply(null, refScores);
    const minScore = Math.min(minTargetScore, minRefScore)
    const maxTargetScore = Math.max.apply(null, targetScores);
    const maxRefScore = Math.max.apply(null, refScores);
    const maxScore = Math.max(maxTargetScore, maxRefScore)
    const binwidth = (maxScore-minScore)/15;
    let chartData = [];
    for (let i=0; i<15; i++) {
      chartData.push({
        score: ((minScore+i*binwidth) + minScore+(i+1)*binwidth)/2,
        frequency: targetScores.filter(x => (x-(minScore+i*binwidth))*(x-(minScore+(i+1)*binwidth)) < 0).length
      });
    }
    return chartData;
  }

// get y-coordinates for patient score vline
const getLineLength = function(cancer, refCancer, score) {
  const chartData = getChartData(cancer, refCancer, score);
  let scoreFrequencies = chartData.map (function(i) {return (i.frequency)});
  const lineLength = (Math.max.apply(null,scoreFrequencies) * 1.2);
  return lineLength;
}

//make VictoryBar more histogram-ish by removing gaps between bars
const getBinWidth = function(targetCancer, refCancer, scoreName, score) {
  const targetScores = getCancerScores(targetCancer, scoreName);
  const refScores = getCancerScores(refCancer, scoreName);
  const targetMin = Math.min.apply(null, targetScores);
  const targetMax =  Math.max.apply(null, targetScores);
  const referenceMax =  Math.max.apply(null, refScores)
  const referenceMin = Math.min.apply(null, refScores);
  const range = Math.max(targetMax, referenceMax, score) -
                Math.min(targetMin, referenceMin, score);
  const binwidth = 350*(Math.max(targetMax, referenceMax) - Math.min(targetMin, referenceMin))/(15*range);
  return binwidth;
}

class ScoreChart extends Component {

//update if score changes or if cancer type changes to a valid tcga entry
  shouldComponentUpdate(nextProps, nextState) {
    let chartData = getCancerScores(nextProps.targetCancer, this.props.scoreName);
    return (
      this.props.patientScore !== nextProps.patientScore
      || chartData.length !== 0
    );
  }

  render() {
    if (isNaN(this.props.patientScore)) return(null);
    if (this.props.targetCancer === '') return(null);
    else return (
      <div>
        <Panel
          header = {this.props.scoreLabel + ": " + this.props.patientScore}
          style={{width: '45%', float: 'left', margin: 5}}
          bsStyle={this.props.panelColor}>
          <VictoryChart>
            <VictoryBar
              data= {getChartData(this.props.targetCancer, 'OV', this.props.scoreName)}
              x="score"
              y="frequency"
              style={{
                data: {
                  fill:"navajowhite",
                  width: getBinWidth(this.props.targetCancer, 'OV', this.props.scoreName, this.props.patientScore),
                  stroke: "black",
                  strokeWidth: 0.5
                }
              }}
        />
            <VictoryBar
              data= {getChartData('OV', this.props.targetCancer, this.props.scoreName)}
              x="score"
              y= {(d) => -(d.frequency)}
              style={{
                data: {
                  fill: "tomato",
                  width: getBinWidth(this.props.targetCancer, 'OV', this.props.scoreName, this.props.patientScore),
                  stroke: "black",
                  strokeWidth: 0.5
                }
              }}
            />
            <VictoryAxis
              style={{axis:{width:450}}}
              domainPadding = {0}
            />
            <VictoryAxis
             dependentAxis
             tickLabelComponent={<VictoryLabel text={(datum) => Math.abs(datum)}/>}
            />
            <VictoryLine
             data = {[
               {x:this.props.patientScore, y:-getLineLength('OV', this.props.targetCancer, this.props.scoreName)},
               {x:this.props.patientScore, y:getLineLength(this.props.targetCancer, 'OV', this.props.scoreName)}
             ]}
            />
            <VictoryLine
             data = {[
               {x:this.props.cutoffScore, y:-getLineLength('OV', this.props.targetCancer, this.props.scoreName)},
               {x:this.props.cutoffScore, y:getLineLength(this.props.targetCancer, 'OV', this.props.scoreName)}
               ]}
             style={{
               data: {
                 stroke: "gray",
                 strokeWidth: 0.75
               }
             }}
            />
          </VictoryChart>
        </Panel>
      </div>
      );
  }
}

export default ScoreChart;
