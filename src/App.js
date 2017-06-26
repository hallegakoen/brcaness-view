import React, { Component } from 'react';
import ScoreChart from './Components/ScoreChart';
import {Col, Jumbotron} from 'react-bootstrap'

//renders form, renders corresponding chart from inputted scores
class App extends Component {

  constructor() {
    super();
    this.state = {hrdScore: '',
                  parpi7Score: '',
                  cancerType: ''};
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    const target = event.target;
    const name = target.name;
    this.setState({[name]: event.target.value});
  }

  render() {
    return (
      <div>
        <Col xs = {12} sm = {6} md = {2} lg = {2}>
            <Jumbotron>
              HRD:
              <input
                name="hrdScore"
                type="number"
                label = "HRD"
                onChange={this.handleChange}
                value={this.state.hrdScore}/>
              <br />
              PARPi-7:
              <input
                name="parpi7Score"
                type="number"
                label = "PARPi-7"
                onChange={this.handleChange}
                value={this.state.parpi7Score}/>
              TCGA cancer type:
              <input
                name="cancerType"
                type="string"
                label = "cancerType"
                onChange={this.handleChange}
                value={this.state.cancerType}/>
            </Jumbotron>
        </Col>
        <Col xs = {12} sm = {6} md = {10} lg = {10}>
          <ScoreChart
            scoreLabel = "HRD"
            scoreName = "hrd"
            patientScore = {parseFloat(this.state.hrdScore)}
            targetCancer = {this.state.cancerType}/>
          <ScoreChart
            scoreLabel = "PARPi-7"
            scoreName = "parpi7"
            patientScore = {parseFloat(this.state.parpi7Score)}
            targetCancer = {this.state.cancerType}/>
        </Col>
      </div>
    )
  }
}
  export default App;
