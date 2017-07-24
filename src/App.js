import React, { Component } from 'react';
import {Col, Jumbotron, Button, Form, Modal, Table} from 'react-bootstrap';
import tcgaData from './Components/tcgaData.json';
import ScoreDisplay from './Components/ScoreDisplay';
import PatientTable from './Components/PatientTable';

var xenaQuery = require('ucsc-xena-client/dist/xenaQuery');
var Rx = require('rxjs');
var pancanHub = 'https://pancanatlas.xenahubs.net';
var phenotypeDense = 'TCGA_phenotype_denseDataOnlyDownload.tsv'
var subtype = 'TCGASubtype.20170308.tsv';
var subtypeSelected = 'Subtype_Selected';
var age = 'age_at_initial_pathologic_diagnosis';
var gender = 'gender';


function codedPhenotype(hub, dataset, samples, fields) {
	return Rx.Observable.zip(
		xenaQuery.datasetProbeValues(hub, dataset, samples, fields),
		xenaQuery.fieldCodes(hub, dataset, fields),
		function (positionAndProbes, codes) {
			return {
				samples: samples,
				probes: positionAndProbes[1], // There's no position for phenotype
				codes: codes
			};
		})
}


class App extends Component {
  constructor() {
    super();
    this.state = {
      patient: '',
      cancer: '',
      samples: {
        sample: '',
        scores: {
          HRD: '',
          PARPi7: '',
          RPS: '',
          LST: '',
          AI: '',
          LOH: '',
          signature3: ''
        }
      },
      colorcode: 'default',
      filter: '',
			targetSamples: '',
			refSamples: ''
    };
    this.handlePatientSelect = this.handlePatientSelect.bind(this);
    this.handleFilter = this.handleFilter.bind(this);
  }

	handleFilter(e) {
		const targetSamples = tcgaData.filter(function(e) {return e.sample !== ""})
		  .filter(function(e) {return e.cancer === this.state.cancer}, this)
			.map((e) => e.sample)
		this.setState({filter: e.target.value});
		codedPhenotype(pancanHub, e.target.name, targetSamples, [e.target.value])
		  .subscribe(result => this.setState({targetSamples: result}));

		const refSamples = tcgaData.filter(function(e) {return e.sample !== ""})
			.filter(function(e) {return e.cancer === 'OV'}, this)
			.map((e) => e.sample)
		this.setState({filter: e.target.value});
		codedPhenotype(pancanHub, e.target.name, refSamples, [e.target.value])
			.subscribe(result => this.setState({refSamples: result}));
	}

	handlePatientSelect(e) {
	  const matchingData = tcgaData.find(element => element.patient + ' (' + element.cancer + ')' === e.target.value);
	  this.setState({
	    patient: matchingData.patient,
	    cancer: matchingData.cancer,
	    samples: {
	      sample: matchingData.sample,
	      scores: {
	        HRD: matchingData.HRD,
	        PARPi7: matchingData.PARPi7,
	        RPS: matchingData.RPS,
	        LST: matchingData.LST,
	        AI: matchingData.AI,
	        LOH: matchingData.LOH,
	        signature3: matchingData.signature3
	      }
	    }
	  })
	}

render() {
  const patientList = tcgaData.map((code)=><option key={tcgaData.indexOf(code)}>{code.patient} ({code.cancer})</option>)
    return (
      <div>
        <Col xs = {12} sm = {6} md = {2} lg = {2}>
            <Jumbotron>
            Patient:
            <select
              name="patient"
              type="string"
              onChange={this.handlePatientSelect}
              value={this.state.patient + ' (' + this.state.cancer + ')'}>
              <option> -- select TCGA patient -- </option>
              {patientList}
            </select>
            <br/>
            Filter by patient's:'

						<p/>

							<input value={age} type="radio" onChange={this.handleFilter} name={phenotypeDense}/>age
							<br/>
							<input value={gender} type="radio" onChange={this.handleFilter} name={phenotypeDense}/>gender
							<br/>
							<input value={subtypeSelected} type="radio" onChange={this.handleFilter} name={subtype}/>subtype

            <p/>

              <input value="default" type="radio" defaultChecked name="colorcode"/>Default View
              <br/>
              <input value="percentSensitive" type="radio" name="colorcode"/>Show % platinum response at each score
              <br/>
              <input value="sensitivity" type="radio" name="colorcode"/>Show platinum response at each score
            </Jumbotron>
        </Col>
        <Col xs = {12} sm = {6} md = {10} lg = {10}>
            <ScoreDisplay patientSample = {this.state.samples.sample} patientScores = {this.state.samples.scores} targetCancer = {this.state.cancer} subtypeSelected = {this.state.subtypeSelected} queriedTarget = {this.state.targetSamples} queriedRef = {this.state.refSamples}/>
        </Col>

      </div>
    )
  }
}
  export default App;
