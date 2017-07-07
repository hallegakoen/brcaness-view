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
    const targetMin = Math.min.apply(null, getCancerScores(cancer,this.props.scoreName));
    const targetMax =  Math.max.apply(null, getCancerScores(cancer,this.props.scoreName));

    const referenceMax =  Math.max.apply(null, getCancerScores('OV',this.props.scoreName))
    const referenceMin = Math.min.apply(null, getCancerScores('OV',this.props.scoreName));

    const range = Math.max(targetMax, referenceMax, this.props.patientScore) -
                  Math.min(targetMin, referenceMin, this.props.patientScore);

    const binwidth = (targetMax - targetMin)/(15*range);
    console.log(this.props.scoreName, binwidth, range);
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
                       width:350 * this.getBinWidth('OV'),
                       stroke: "black",
                      strokeWidth: 1,
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
