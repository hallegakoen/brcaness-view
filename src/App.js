import React, { Component } from 'react';
import {Col, Jumbotron, Button, Form} from 'react-bootstrap';
import tcgaData from './Components/tcgaData.json';
import ScoreDisplay from './Components/ScoreDisplay';


class App extends Component {
  constructor() {
    super();
    this.state = {
      scores: {
        hrd: '',
        parpi7: '',
        rps: '',
        lst: '',
        ai: '',
        hrd_loh: ''
      },
      cancerType: '',
      colorcode: 'default',
      showModal:'false'
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleScoreChange = this.handleScoreChange.bind(this);
    this.close = this.close.bind(this);
    this.open = this.open.bind(this);
  }

 close() {
   this.setState({ showModal: false });
  }

 open() {
   this.setState({ showModal: true });
  }

  handleScoreChange(e) {
    const updatedScores = Object.assign({},this.state.scores,{[e.target.name]: e.target.value});
    this.setState({scores: updatedScores});
  }

  handleChange(e) {
    this.setState({[e.target.name]: e.target.value});
  }


  render() {
    require('./demo');
    const cancerTypes = [...new Set(tcgaData.map(a => a.cancer))];
    const cancerList = cancerTypes.map(function(type) {
      return(<option key={type}>{type}</option>)
    });

    return (
      <div>
        <Col xs = {12} sm = {6} md = {2} lg = {2}>
            <Jumbotron>
            <Button
              bsStyle="primary"
              block
              onClick={this.open}>Select TCGA patient...</Button>
            <p/>
            <h3>Or enter data below:</h3>
            <p/>
            TCGA cancer type:
            <select
              name="cancerType"
              type="string"
              onChange={this.handleChange}
              value={this.state.cancerType}>
              <option> -- select an option -- </option>
              {cancerList}
            </select>
            <p/>
            <Form inline>
              HRD:
              <input
                bsSize="sm"
                name="hrd"
                type="number"
                onChange={this.handleScoreChange}
                value={this.state.scores.hrd}/>
              PARPi-7:
              <input
                bsSize="sm"
                name="parpi7"
                type="number"
                onChange={this.handleScoreChange}
                value={this.state.scores.parpi7}/>
             RPS:
              <input
                bsSize="sm"
                name="rps"
                type="number"
                onChange={this.handleScoreChange}
                value={this.state.scores.rps}/>
              LST:
              <input
                bsSize="sm"
                name="lst"
                type="number"
                onChange={this.handleScoreChange}
                value={this.state.scores.lst}/>
              NtAI:
              <input
                bsSize="sm"
                name="ai"
                type="number"
                onChange={this.handleScoreChange}
                value={this.state.scores.ai}/>
              LOH:
              <input
                bsSize="sm"
                name="hrd_loh"
                type="number"
                onChange={this.handleScoreChange}
                value={this.state.scores.hrd_loh}/>
              </Form>

              <p/>
              <input value="default" type="radio" checked="checked" name="colorcode"/>Default View
              <br/>
              <input value="percentSensitive" type="radio" name="colorcode"/>Show % platinum response at each score
              <br/>
              <input value="sensitivity" type="radio" name="colorcode"/>Show platinum response at each score
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
