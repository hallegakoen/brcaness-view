import React, { Component } from 'react';
import {Col, Jumbotron} from 'react-bootstrap';
import tcgaData from './Components/tcgaData.json';
import ScoreDisplay from './Components/ScoreDisplay'

class App extends Component {
  constructor() {
    super();
    this.state = {
      scores: {
        hrd: '',
        parpi7: '',
      },
      cancerType: ''
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleScoreChange = this.handleScoreChange.bind(this);
  }

  handleScoreChange(e) {
    const updatedScores = Object.assign({},this.state.scores,{[e.target.name]: e.target.value});
    this.setState({scores: updatedScores});
  }

  handleChange(e) {
    this.setState({[e.target.name]: e.target.value});
  }

  render() {
    const cancerTypes = [...new Set(tcgaData.map(a => a.cancer))];
    const cancerList = cancerTypes.map(function(type) {
      return(<option key={type}>{type}</option>)
    });

    return (
      <div>
        <Col xs = {12} sm = {6} md = {2} lg = {2}>
            <Jumbotron>
              HRD:
              <input
                name="hrd"
                type="number"
                onChange={this.handleScoreChange}
                value={this.state.scores.hrd}/>
              <br />
              PARPi-7:
              <input
                name="parpi7"
                type="number"
                onChange={this.handleScoreChange}
                value={this.state.scores.parpi7}/>
          {/*    RPS:
              <input
                name="rps"
                type="number"
                onChange={this.handleScoreChange}
                value={this.state.scores.rps}/>
              LST:
              <input
                name="lst"
                type="number"
                onChange={this.handleScoreChange}
                value={this.state.scores.lst}/> */}
              TCGA cancer type:
              <select
                name="cancerType"
                type="string"
                onChange={this.handleChange}
                value={this.state.cancerType}>
                {cancerList}
              </select>
            </Jumbotron>
        </Col>
        <Col xs = {12} sm = {6} md = {10} lg = {10}>
            <ScoreDisplay patientScores = {this.state.scores} targetCancer = {this.state.cancerType}/>
        </Col>
      </div>
    )
  }
}
  export default App;
