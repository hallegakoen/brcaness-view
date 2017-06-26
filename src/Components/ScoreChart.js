import {Panel} from 'react-bootstrap';
import React, {Component} from 'react';
import tcgaData from './tcgaData.json';
import {VictoryBar, VictoryAxis, VictoryChart, VictoryLine, VictoryLabel} from 'victory';
import * as d3 from "d3-array";

const getCancerScores = function(cancer, score) {
  const cancerData = tcgaData.filter(function(e) {return e.cancer === cancer});
  const cancerScores = cancerData.map((e) => e[score]);
  return cancerScores;
}

// format data for VictoryBar
const getChartData = function(cancer, score) {
  const histogram = d3.histogram()(getCancerScores(cancer, score));
  let chartData = histogram.map(function(i) {
    return({
              score: (i.x0 + i.x1)/2,
              frequency: i.length
    });
  });
  return chartData;
}

// get y-coordinates for patient score vline
const getLineLength = function(cancer, score) {
  const chartData = getChartData(cancer, score);
  let scoreFrequencies = chartData.map (function(i) {return (i.frequency)});
  const lineLength = (Math.max.apply(null,scoreFrequencies) * 1.2);
  return lineLength;
}

class ScoreChart extends Component {

  //make VictoryBar more histogram-ish by removing gaps between bars
  getBinWidth(cancer) {
    const targetHistogram = d3.histogram()(getCancerScores(cancer, this.props.scoreName));
    const targetMin = targetHistogram[0].x0;
    const targetMax =  targetHistogram[targetHistogram.length - 1].x1;

    const referenceHistogram = d3.histogram()(getCancerScores('OV', this.props.scoreName));
    const referenceMax =  referenceHistogram[referenceHistogram.length - 1].x1;
    const referenceMin = referenceHistogram[0].x0;

    const range = Math.max(targetMax, referenceMax, this.props.patientScore) -
                  Math.min(targetMin, referenceMin, this.props.patientScore);
    const binwidth = (targetHistogram[1].x1 - targetHistogram[1].x0)/range;
    return binwidth;
  }

//update if score changes or if cancer type changes to a valid tcga entry
  shouldComponentUpdate(nextProps, nextState) {
    let chartData = getChartData(nextProps.targetCancer, this.props.scoreName);
    return (
      this.props.patientScore !== nextProps.patientScore
      || chartData.length !== 1
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
          bsStyle = "primary">
          <VictoryChart>
            <VictoryBar
              data= {getChartData(this.props.targetCancer, this.props.scoreName)}
              x="score"
              y="frequency"
              style={{
                data: {fill:"navajowhite",
                       width:350 * this.getBinWidth(this.props.targetCancer),
                }
              }}
        />
            <VictoryBar
              data= {getChartData('OV', this.props.scoreName)}
              x="score"
              y= {(d) => -(d.frequency)}
              style={{
                data: {fill: "tomato",
                       width:350 * this.getBinWidth('OV')
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
               {x:this.props.patientScore, y:-getLineLength('OV', this.props.scoreName)},
               {x:this.props.patientScore, y:getLineLength(this.props.targetCancer, this.props.scoreName)}
             ]}
            />
          </VictoryChart>
        </Panel>
      </div>
      );
  }
}

export default ScoreChart;
