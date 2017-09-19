import {Panel} from 'react-bootstrap';
import React, {Component} from 'react';
import data from './data.json';
import {VictoryBar, VictoryAxis, VictoryChart, VictoryLine, VictoryLabel} from 'victory';


const getPercentile = function(y, targetScores, refScores, scoreValue) {
  let data;
  if (y > 0) data = targetScores;
  else data = refScores;
  let closestValue = data.sort( (a, b) => Math.abs(scoreValue - a) - Math.abs(scoreValue - b) )[0];
  data.sort(function(a,b) {return a-b});
  return (100*data.indexOf(closestValue)/data.length).toFixed(2);
}

const getChartData = function(targetScores, min, binwidth) {
    let chartData = [];
    for (let i=0; i<15; i++) {
      chartData.push({
        score: ((min+i*binwidth) + min+(i+1)*binwidth)/2,
        frequency: targetScores.filter(x => (x-(min+i*binwidth))*(x-(min+(i+1)*binwidth)) < 0).length
      });
    }
    console.log ("tscores", targetScores, "min",min, "bw",binwidth);
    return chartData;

  }

const getLineLength = function(chartData) {
  let scoreFrequencies = chartData.map (function(i) {return (i.frequency)});
  const lineLength = (Math.max.apply(null,scoreFrequencies) * 1.2);
  return lineLength;
}

//make VictoryBar more histogram-ish by removing gaps between bars
const getBinWidth = function(targetScores, refScores, score) {
  const targetMin = Math.min.apply(0, targetScores);
  const targetMax =  Math.max.apply(0, targetScores);
  const referenceMax =  Math.max.apply(0, refScores)
  const referenceMin = Math.min.apply(0, refScores);
  const range = Math.max(targetMax, referenceMax, score) -
                Math.min(targetMin, referenceMin, score);
  const binwidth = 350*(Math.max(targetMax, referenceMax) - Math.min(targetMin, referenceMin))/(15*range);
  return binwidth;
}

const getBinSize = function(targetScores, refScores, score, min) {
    const targetMax =  Math.max.apply(null, targetScores);
    const referenceMax =  Math.max.apply(null, refScores);
    const max = Math.max(targetMax, referenceMax, score);
    return (max-min)/15;
}

const getMin = function(targetScores, refScores, score) {
    const targetMin = Math.min.apply(null, targetScores);
    const referenceMin = Math.min.apply(null, refScores);
    const min =   Math.min(targetMin, referenceMin, score, 0);
    return min;
}

class ScoreChart extends Component {

  constructor() {
    super();
    this.getCancerScores = this.getCancerScores.bind(this);
  }

  getCancerScores(cancer, score, brcaMutations) {
    let filters = [];

    Object.keys(this.props.filters).forEach(function(key) {
      if (this.props.filters[key] == true) {
        filters.push(key);
      }
    }, this);

    let defaultData = data.filter(function(e) {
      if (brcaMutations === null) return (e.acronym === cancer && e[score] !== null);
      if (brcaMutations === 'BRCA1') return (e.acronym === cancer && e[score] !== null) && e.BRCA1 === 1;
      if (brcaMutations === 'BRCA2') return (e.acronym === cancer && e[score] !== null && e.BRCA2 === 1);
    });

    filters.forEach(function(filter) {
      if (filter === 'subtypeSelected' && cancer === this.props.targetCancer) {
        defaultData = defaultData.filter(function(e) {return (e[filter] === this.props.subtypeSelected)}, this)
      } else if (filter !== 'subtypeSelected') {
        defaultData = defaultData.filter(function(e) {return (e[filter] === 1)})
      };
    }, this);

    const cancerScores = defaultData.map((e) => e[score]);

    return cancerScores;
  }

  render() {

    const targetScores = this.getCancerScores(this.props.targetCancer, this.props.scoreName, null);
    const refScores = this.getCancerScores('OV', this.props.scoreName, null);
    const min = getMin(targetScores, refScores, this.props.patientScore);
    const binSize = getBinSize(targetScores, refScores, this.props.patientScore, min);
    const targetBrca1Scores = this.getCancerScores(this.props.targetCancer, this.props.scoreName, 'BRCA1');
    const refBrca1Scores = this.getCancerScores('OV', this.props.scoreName, 'BRCA1');
    const targetBrca2Scores = this.getCancerScores(this.props.targetCancer, this.props.scoreName, 'BRCA2').concat(targetBrca1Scores);
    const refBrca2Scores = this.getCancerScores('OV', this.props.scoreName, 'BRCA2').concat(refBrca1Scores);
    const targetBrca1Chart = getChartData(targetBrca1Scores, min, binSize);
    const targetBrca2Chart = getChartData(targetBrca2Scores, min, binSize);
    const chartData = getChartData(targetScores, min, binSize);
    const refChartData = getChartData(refScores, min, binSize);
    const refBrca1Chart = getChartData(refBrca1Scores, min, binSize);
    const refBrca2Chart = getChartData(refBrca2Scores, min, binSize);
    const binwidth = getBinWidth(targetScores, refScores, this.props.patientScore);

    if (isNaN(this.props.patientScore)) return(null);
    if (this.props.targetCancer === '') return(null);
    if (this.props.filters.BRCA1 || this.props.filters.BRCA2) return (
      <div>
        <Panel
          header = {this.props.scoreName + ": " + this.props.patientScore}
          style={{width: '45%', float: 'left', margin: 5}}
          bsStyle={this.props.panelColor}>
          <VictoryChart>
            <VictoryBar
              data= {chartData}
              x="score"
              y="frequency"
              style={{
                data: {
                  fill:"gray",
                  width:binwidth
                }
              }}
        />
            <VictoryBar
              data= {refChartData}
              x= "score"
              y= {(d) => -(d.frequency)}
              style={{
                data: {
                  fill: "navajowhite",
                  width:binwidth
                }
              }}
            />

            <VictoryAxis
              style={{axis:{width:450}}}
              domainPadding={0}
              axisLabelComponent={<VictoryLabel text={this.props.scoreName} x={425} dy={-30} textAnchor="start"/>}
            />
            <VictoryAxis
             dependentAxis
             tickLabelComponent={<VictoryLabel text={(datum) => Math.abs(datum)}
             />}
            />
            <VictoryLine
             data = {[
               {x:this.props.patientScore, y:-getLineLength(refChartData)},
               {x:this.props.patientScore, y:getLineLength(chartData)}
             ]}
             labels={(d)=>getPercentile(d.y, targetScores, refScores, this.props.patientScore) + '%ile'}
             labelComponent={<VictoryLabel renderInPortal/>}
             />
          </VictoryChart>
        </Panel>
      </div>

    )


    else return (
      <div>
        <Panel
          header = {this.props.scoreName + ": " + this.props.patientScore}
          style={{width: '45%', float: 'left', margin: 5}}
          bsStyle={this.props.panelColor}>
          <VictoryChart>
            <VictoryBar
              data= {chartData}
              x="score"
              y="frequency"
              style={{
                data: {
                  fill:"gray",
                  width:binwidth
                }
              }}
        />
            <VictoryBar
              data= {refChartData}
              x= "score"
              y= {(d) => -(d.frequency)}
              style={{
                data: {
                  fill: "navajowhite",
                  width:binwidth
                }
              }}
            />
            <VictoryBar
              data= {targetBrca2Chart}
              x="score"
              y="frequency"
              style={{
                data: {
                  fill:"blue",
                  width:binwidth
                }
              }}
        />
        <VictoryBar
              data= {refBrca2Chart}
              x= "score"
              y= {(d) => -(d.frequency)}
              style={{
                data: {
                  fill: "blue",
                  width:binwidth
                }
              }}
            /> 
            <VictoryBar
              data= {targetBrca1Chart}
              x="score"
              y="frequency"
              style={{
                data: {
                  fill:"red",
                  width:binwidth
                }
              }}
        />
            <VictoryBar
              data= {refBrca1Chart}
              x= "score"
              y= {(d) => -(d.frequency)}
              style={{
                data: {
                  fill: "red",
                  width:binwidth
                }
              }}
            />

            <VictoryAxis
              style={{axis:{width:450}}}
              domainPadding={0}
              axisLabelComponent={<VictoryLabel text={this.props.scoreName} x={425} dy={-30} textAnchor="start"/>}
            />
            <VictoryAxis
             dependentAxis
             tickLabelComponent={<VictoryLabel text={(datum) => Math.abs(datum)}
             />}
            />
            <VictoryLine
             data = {[
               {x:this.props.patientScore, y:-getLineLength(refChartData)},
               {x:this.props.patientScore, y:getLineLength(chartData)}
             ]}
             labels={(d)=>getPercentile(d.y, targetScores, refScores, this.props.patientScore) + '%ile'}
             labelComponent={<VictoryLabel renderInPortal/>}
             />

          </VictoryChart>
        </Panel>
      </div>
      );
  }
}

export default ScoreChart;
