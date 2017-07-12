var xenaQuery = require('ucsc-xena-client/dist/xenaQuery');
var Rx = require('rxjs');

var pancanHub = 'https://pancanatlas.xenahubs.net';
var phenotype = 'phenotype_synapse.xena';
var acronym = 'acronym';
var cohort ='TCGA PanCanAtlas';

var subtype = 'TCGASubtype.20170308.tsv';
var subtypeSelected = 'Subtype_Selected';

// Get all samples for the cohort.
//
// cohortSamples(hub, cohort, rowLimit) returns an Observable.
// Call .subscribe(callback) to start the request.
xenaQuery.cohortSamples(pancanHub, cohort, null).subscribe(function (samples) {
	console.log('samples', samples);
});

// Get field values and codes for a list of phenotype fields.
function codedPhenotype(hub, dataset, samples, fields) {
	// zip runs two queries in parallel, and combines the result
	// with a callback function.
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

// Get all samples for the cohort, then get a phenotype value for those
// samples, and codes (enumerations) for the values.
//
// .flatMap() allows chaining one Observable with another (similar to nesting ajax
// callbacks). Here, the codedPhenotype queries depends on the sample list,
// so we chain it with flatMap.
//
// Usually you would instead fetch the sample list once, store it in a
// variable, and pass it to codedPhenotype after some event (like user input).
xenaQuery.cohortSamples(pancanHub, cohort, null ).flatMap(function (samples) {
	// We return the chained Observable from the flatMap function.
	return codedPhenotype(pancanHub, phenotype, samples, [acronym]);
}).subscribe(function (result) {
	console.log('samples and acronym field', result);
});

// Similarly, fetching a subtype field.
xenaQuery.cohortSamples(pancanHub, cohort, null ).flatMap(function (samples) {
	return codedPhenotype(pancanHub, subtype, samples, [subtypeSelected]);
}).subscribe(function (result) {
	console.log('samples and subtype field', result);
});
