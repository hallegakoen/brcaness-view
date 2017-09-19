import React, { Component } from 'react';
import {Col, Jumbotron, Table} from 'react-bootstrap';
import data from './Components/data.json';
import ScoreDisplay from './Components/ScoreDisplay';
import {VictoryLegend, VictoryChart} from 'victory';

class App extends Component {
  constructor() {
    super();
    this.state = {
      sample: '',
      acronym: '',
			subtypeSelected: '',
			BRCA1: '',
			BRCA2: '',
      scores: {
          HRD: '',
          LST: '',
          AI: '',
          LOH: '',
      },
      filters: {
				BRCA1: false,
				BRCA2: false,
				subtypeSelected: false
			}
    };

    this.handleSelect = this.handleSelect.bind(this);
    this.handleFilter = this.handleFilter.bind(this);
  }

	handleSelect(e) {
	  const x = data.find(element => element.sample + ' (' + element.acronym + ' ' + element.subtypeSelected + ')' === e.target.value);
	  this.setState({
			sample: x.sample,
      acronym: x.acronym,
			subtypeSelected: x.subtypeSelected,
      scores: {
          HRD: x.HRD,
          LST: x.LST,
          AI: x.AI,
          LOH: x.LOH,
      },
      BRCA1: '',
			BRCA2: ''
	  })
	}

  handleFilter(e) {
  const filter = e.target.value
	const newState = !this.state.filters[e.target.value]
  this.setState(({filters}) => ({filters: {
    ...filters,
    [filter]: newState
  }}));
  }
// extra parentheses ?

render() {
  const sampleList = data.filter(function(sample) {return sample.HRD}).map((sample)=><option key={data.indexOf(sample)}>{sample.sample} ({sample.acronym} {sample.subtypeSelected})</option>)
    return (
      <div>
        <Col xs = {12} sm = {6} md = {2} lg = {2}>
            <Jumbotron>
            Sample:
            <select
              name="sample"
              type="string"
              onChange={this.handleSelect}
              value={this.state.sample + ' (' + this.state.acronym + ' ' + this.state.subtypeSelected + ')'}>
              <option> -- select TCGA sample -- </option>
              {sampleList}
            </select>
            <br/>



						<p/>
						  <fieldset>
              <legend>Filter samples</legend>
							<input value="BRCA1" type="checkbox" onChange={this.handleFilter} name="filter"/>
							<label htmlFor="BRCA1">Display somatic BRCA1 mutants</label>
							<br/>
              <p/>
							<input value="BRCA2" type="checkbox" onChange={this.handleFilter} name="filter"/>
							<label htmlFor="BRCA2">Display somatic BRCA2 mutants</label>
							<br/>
              <p/>
							<input value="subtypeSelected" type="checkbox" onChange={this.handleFilter} name="filter"/>
              <label htmlFor="subtypeSelected">Display samples with same subtype as patient</label>

							</fieldset>
            <p/>

              <VictoryLegend x={125} y={50}
                  title="Legend"
                centerTitle
                gutter={20}
                style={{ border: { stroke: "black" }, title: {fontSize: 20 } }}
                data={[
                  { name: "somatic BRCA1 mutants", symbol: { fill: "red" } },
                  { name: "somatic BRCA2 mutants", symbol: { fill: "blue" } },
                  { name: "Target Dataset: TCGA-" + this.state.acronym, symbol: { fill: "gray" } },
                  { name: "Reference Dataset: TCGA-OV", symbol: { fill: "navajowhite" } }
                ]}
              />

            </Jumbotron>
        </Col>
        <Col xs = {12} sm = {6} md = {10} lg = {10}>
            <ScoreDisplay
						sample = {this.state.sample}
						patientScores = {this.state.scores}
						targetCancer = {this.state.acronym}
						subtypeSelected = {this.state.subtypeSelected}
						filters = {this.state.filters} />
        </Col>

      </div>
    )
  }
}
  export default App;
