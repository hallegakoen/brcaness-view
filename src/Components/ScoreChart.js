import {Panel} from 'react-bootstrap';
import React, {Component} from 'react';
import tcgaData from './tcgaData.json';
import {VictoryBar, VictoryAxis, VictoryChart, VictoryLine, VictoryLabel} from 'victory';



const getCancerData = function(cancer) { //chanfe to function(filtersArray, score)
  const cancerData = tcgaData.filter(function(e) {return e.cancer === cancer }); //filter tcga array into array of obj where element.cancer = cancer
	return cancerData; //array
}

const filterData = function(query, sample, other) {
	let probes = [];
	let finalData = [];
	const index = query.samples.findIndex(function(e) {return e === sample}) //index of patient sample
  const patientProbe = query.probes[0][index] //patient's probe
  for(let i = 0; i<query.probes[0].length; i++) {
		if (query.probes[0][i] === patientProbe) {
			probes.push(i)
		}
  }
		const filteredData = probes.map(e => query.samples[e]);
		filteredData.forEach(
			function(e) {
			const tcgaLocation = tcgaData.map(function(a) {return a.sample;}).indexOf(e);
			if (tcgaLocation !== -1) {
			  finalData.push(tcgaData[tcgaLocation]);
		} })
		console.log(finalData)
}

//get array of scores from tcgaData.json
const getCancerScores = function(cancer, score) { //chanfe to function(filtersArray, score)
  const filteredData = getCancerData(cancer);
	const cancerScores = filteredData.filter(function(e) {return e[score] !== null}).map(e => e[score]);
  return cancerScores;
}

const getPercentile = function(y, cancer, score, scoreValue) {
  let cancerType;
  if (y > 0) cancerType = cancer;
  else cancerType = 'OV';
  const data = getCancerScores(cancerType, score);
  let closestValue = data.sort( (a, b) => Math.abs(scoreValue - a) - Math.abs(scoreValue - b) )[0];
  data.sort(function(a,b) {return a-b});
  return (100*data.indexOf(closestValue)/data.length).toFixed(2);
}

// const binData = {
//   targetScores: function(cancer, score) {getCancerScores(cancer, score)},
//   refScores: function(refCancer, score) {getCancerScores(refCancer, score)},
//   minTargetScore: Math.min.apply(null, this.targetScores),
//   minRefScore: Math.min.apply(null, this.refScores),
//   minScore: Math.min(this.minTargetScore, this.minRefScore),
//   maxTargetScore: Math.max.apply(null, this.targetScores),
//   maxRefScore: Math.max.apply(null, this.refScores),
//   maxScore: Math.max(this.maxTargetScore, this.maxRefScore),
//   binwidth: (this.maxScore-this.minScore)/15,
//   range: Math.max(targetMax, referenceMax, score) - Math.min(targetMin, referenceMin, score),
//   renderedBinwidth: 350*(Math.max(targetMax, referenceMax) - Math.min(targetMin, referenceMin))/(15*this.range),
//
// }
//bin array for VictoryBar
const getChartData = function(cancer, refCancer, score) {
  //rewrite minscore and binwidth
    const targetScores = getCancerScores(cancer, score);
    const refScores = getCancerScores(refCancer, score);
    const targetMin = Math.min.apply(null, targetScores);
    const refMin = Math.min.apply(null, refScores);
    const min = Math.min(targetMin, refMin);
    const targetMax = Math.max.apply(null, targetScores);
    const refMax = Math.max.apply(null, refScores);
    const max = Math.max(targetMax, refMax);
    const binwidth = (max-min)/15;
    let chartData = [];
    for (let i=0; i<15; i++) {
      chartData.push({
        score: ((min+i*binwidth) + min+(i+1)*binwidth)/2,
        frequency: targetScores.filter(x => (x-(min+i*binwidth))*(x-(min+(i+1)*binwidth)) < 0).length
				//x = -3, min = -4, binwidth = 1. (1)*(-3-(-4+1))
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
  // shouldComponentUpdate(nextProps, nextState) {
  //   let chartData = getCancerScores(nextProps.targetCancer, this.props.scoreName);
  //   return (
  //     this.props.patientScore !== nextProps.patientScore
  //     || chartData.length !== 0
	// 		|| this.props.queriedFilter !== nextProps.queriedFilter
  //   );
  // }

  render() {
		console.log(this.props.queriedTarget, 'hi');
		if (this.props.queriedTarget) {filterData(this.props.queriedTarget, this.props.patientSample)};
    const cancerData = getCancerData(this.props.targetCancer);
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
									strokeWidth: 1
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
									strokeWidth: 1
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
               {x:this.props.patientScore, y:-getLineLength('OV', this.props.targetCancer, this.props.scoreName)},
               {x:this.props.patientScore, y:getLineLength(this.props.targetCancer, 'OV', this.props.scoreName)}
             ]}
             labels={(d)=>getPercentile(d.y,this.props.targetCancer,this.props.scoreName,this.props.patientScore) + '%ile'}
             labelComponent={<VictoryLabel renderInPortal/>}
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
