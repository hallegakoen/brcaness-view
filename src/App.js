import React, { Component } from 'react';
import {Col, Jumbotron, Button, Form, Modal} from 'react-bootstrap';
import tcgaData from './Components/tcgaData.json';
import ScoreDisplay from './Components/ScoreDisplay';


class App extends Component {
  constructor() {
    super();
    this.state = {
      scores: {
        HRD: '',
        PARPi7: '',
        RPS: '',
        LST: '',
        AI: '',
        LOH: ''
      },
      cancerType: '',
      colorcode: 'default',
      showModal: false
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
                name="HRD"
                type="number"
                onChange={this.handleScoreChange}
                value={this.state.scores.HRD}/>
              PARPi-7:
              <input
                name="PARPi7"
                type="number"
                onChange={this.handleScoreChange}
                value={this.state.scores.PARPi7}/>
             RPS:
              <input
                name="RPS"
                type="number"
                onChange={this.handleScoreChange}
                value={this.state.scores.RPS}/>
              LST:
              <input
                name="LST"
                type="number"
                onChange={this.handleScoreChange}
                value={this.state.scores.LST}/>
              NtAI:
              <input
                name="AI"
                type="number"
                onChange={this.handleScoreChange}
                value={this.state.scores.AI}/>
              LOH:
              <input
                name="LOH"
                type="number"
                onChange={this.handleScoreChange}
                value={this.state.scores.LOH}/>
              </Form>

              <p/>
              <input value="default" type="radio" defaultChecked name="colorcode"/>Default View
              <br/>
              <input value="percentSensitive" type="radio" name="colorcode"/>Show % platinum response at each score
              <br/>
              <input value="sensitivity" type="radio" name="colorcode"/>Show platinum response at each score
            </Jumbotron>
        </Col>
        <Col xs = {12} sm = {6} md = {10} lg = {10}>
            <ScoreDisplay patientScores = {this.state.scores} targetCancer = {this.state.cancerType}/>
        </Col>

        <Modal show={this.state.showModal} onHide={this.close}>
    <Modal.Header closeButton>
      <Modal.Title>Select Patient</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      PatientTable
    </Modal.Body>
    <Modal.Footer>
      <Button onClick={this.close}>Close</Button>
    </Modal.Footer>
  </Modal>
      </div>
    )
  }
}
  export default App;
