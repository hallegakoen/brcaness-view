import { Panel} from 'react-bootstrap';
import React, { Component } from 'react';
import tcgaData from './tcgaData.json';
import {VictoryBar, VictoryAxis, VictoryChart, VictoryLine, VictoryLabel} from 'victory';
import * as d3 from "d3-array";

class ScoreChart extends Component {


  getCancerScores(cancer) {
    const cancerData = tcgaData.filter(function(e) {return e.cancer === cancer}, this);
    const cancerScores = cancerData.map(function(e) {return e[this.props.scoreName]}, this);
    return cancerScores;
  }

  // format data for VictoryBar
  getChartData(cancer) {
    const histogram = d3.histogram()(this.getCancerScores(cancer));
    let chartData = [];
    histogram.map(function(i) {
      chartData.push({
                score: (i.x0 + i.x1)/2,
                frequency: i.length
      });
    });
    return chartData;
  }

  //supposed to make VictoryBar more histogram-ish by removing gaps between bars
  getBinWidth(cancer) {
    const targetHistogram = d3.histogram()(this.getCancerScores(cancer));
    const targetMin = targetHistogram[0].x0;
    const targetMax =  targetHistogram[targetHistogram.length - 1].x1;

    const referenceHistogram = d3.histogram()(this.getCancerScores('OV'));
    const referenceMax =  referenceHistogram[referenceHistogram.length - 1].x1;
    const referenceMin = referenceHistogram[0].x0;

    const range = Math.max(targetMax, referenceMax, this.props.patientScore) -
                  Math.min(targetMin, referenceMin, this.props.patientScore);
    const binwidth = (targetHistogram[1].x1 - targetHistogram[1].x0)/range;
    return binwidth;
  }

  // get y-coordinates for patient score vline
  getLineLength(cancer) {
    let scoreFrequencies = [];
    const chartData = this.getChartData(cancer);
    chartData.map (function(i) {scoreFrequencies.push(i.frequency)});
    const lineLength = (Math.max.apply(null,scoreFrequencies) * 1.2);
    return lineLength;
  }

//update if score changes or if cancer type changes to a valid tcga entry
  shouldComponentUpdate(nextProps, nextState) {
    let chartData = this.getChartData(nextProps.targetCancer);
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
              data= {this.getChartData(this.props.targetCancer)}
              x="score"
              y="frequency"
              interpolation="step"
              style={{
                data: {fill:"navajowhite",
                       width:350 * this.getBinWidth(this.props.targetCancer),
                }
              }}
        />
            <VictoryBar
              data= {this.getChartData('OV')}
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
               {x:this.props.patientScore, y:-this.getLineLength('OV')},
               {x:this.props.patientScore, y:this.getLineLength(this.props.targetCancer)}
             ]}
            />
          </VictoryChart>
        </Panel>
      </div>
      );
  }
}

export default ScoreChart;
