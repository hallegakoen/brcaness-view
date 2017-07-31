import {Panel} from 'react-bootstrap';
import React, {Component} from 'react';
import tcgaData from './tcgaData.json';
import {VictoryBar, VictoryAxis, VictoryChart, VictoryLine, VictoryLabel} from 'victory';



const getData = function(query, sample) {

  if (query && query.samples)
	{let probes = [];
	let finalData = [];
	const index = query.samples.findIndex(function(e) {return e === sample}); //index of patient sample
	if (index === -1) {return query
	} else {
  const patientProbe = query.probes[0][index]; //patient's probe
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
		return(finalData);
	}}
	else return query;
}

//get array of scores from array of objects
const getCancerScores = function(cancer, sample, score) {
	let filteredData = [];
	if (cancer && sample) {
		filteredData = getData(cancer, sample); //works here
	}
	console.log('filteredData test', filteredData);
	let cancerScores = filteredData.filter(function(e) {return (e[score] != null)}).map(e => e[score]); //e[score] is undefined
	console.log('canc', score, cancerScores);
  return cancerScores
}

const getPercentile = function(y, targetScores, refScores, scoreValue) {
  let data;
  if (y > 0) data = targetScores;
  else data = refScores;
  let closestValue = data.sort( (a, b) => Math.abs(scoreValue - a) - Math.abs(scoreValue - b) )[0];
  data.sort(function(a,b) {return a-b});
  return (100*data.indexOf(closestValue)/data.length).toFixed(2);
}

//bin array for VictoryBar
const getChartData = function(targetScores, refScores) {
  //rewrite minscore and binwidth
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
const getLineLength = function(targetScores, refScores) {
  const chartData = getChartData(targetScores, refScores);
  let scoreFrequencies = chartData.map (function(i) {return (i.frequency)});
  const lineLength = (Math.max.apply(null,scoreFrequencies) * 1.2);
  return lineLength;
}

//make VictoryBar more histogram-ish by removing gaps between bars
const getBinWidth = function(targetScores, refScores, score) {
  const targetMin = Math.min.apply(null, targetScores);
  const targetMax =  Math.max.apply(null, targetScores);
  const referenceMax =  Math.max.apply(null, refScores)
  const referenceMin = Math.min.apply(null, refScores);
  const range = Math.max(targetMax, referenceMax, score) -
                Math.min(targetMin, referenceMin, score);
  const binwidth = 350*(Math.max(targetMax, referenceMax) - Math.min(targetMin, referenceMin))/(15*range);
	console.log('binwidth test', binwidth);
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
		const targetScores = getCancerScores(this.props.target, this.props.patientSample, this.props.scoreName);
		const refScores = getCancerScores(this.props.reference, this.props.patientSample, this.props.scoreName);
		console.log('targetscoretest', targetScores);
		if (this.props.target.samples) {getData(this.props.target, this.props.patientSample)};
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
              data= {getChartData(targetScores, refScores)}
              x="score"
              y="frequency"
              style={{
                data: {
                  fill:"navajowhite",
                  width: getBinWidth(targetScores, refScores, this.props.patientScore),
									stroke: "black",
									strokeWidth: 1
                }
              }}
        />
            <VictoryBar
              data= {getChartData(refScores, targetScores)}
              x="score"
              y= {(d) => -(d.frequency)}
              style={{
                data: {
                  fill: "tomato",
                  width: getBinWidth(targetScores, refScores, this.props.patientScore),
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
               {x:this.props.patientScore, y:-getLineLength(refScores, targetScores)},
               {x:this.props.patientScore, y:getLineLength(targetScores, refScores)}
             ]}
             labels={(d)=>getPercentile(d.y, targetScores, refScores, this.props.patientScore) + '%ile'}
             labelComponent={<VictoryLabel renderInPortal/>}
            />
            <VictoryLine
             data = {[
               {x:this.props.cutoffScore, y:-getLineLength(refScores, targetScores)},
               {x:this.props.cutoffScore, y:getLineLength(targetScores, refScores)}
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
