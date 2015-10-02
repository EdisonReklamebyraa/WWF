var _ = require('lodash');

var EnergyScenario = require('./energyScenario.js');
var RES = require('./res.js');

var Data = require("./data.js");
var UI = require("./UI.js");
var Results = require("./Results.js");
var ElectricityDataTable = require("./ElectricityDataTable.js");
var BackgroundDataTable = require("./BackgroundDataTable.js");
var InvestmentDataTable = require("./InvestmentDataTable.js");
var SharesDataTable = require("./SharesDataTable.js");
var GrowthRateDataTable = require("./GrowthRateDataTable.js");
var ImpactDataTable = require("./ImpactDataTable.js");


var Charts = require("./Charts.js");




var _ = require("lodash");




module.exports = WWF;

function WWF() {

    this.ui = new UI();
    this.results = new Results();
    this.electricityDataTable = new ElectricityDataTable();
    this.backgroundDataTable = new BackgroundDataTable();
    this.impactDataTable = new ImpactDataTable();
    this.sharesDataTable = new SharesDataTable();
    this.growthRateDataTable = new GrowthRateDataTable();
    this.charts = new Charts();
    this.data = new Data();
}


WWF.prototype = _.create(WWF.prototype, {
    data: null,
    ui: null
});





// load a language
numeral.language('en', {
    delimiters: {
        thousands: ' ',
        decimal: ','
    },
    abbreviations: {
        thousand: 'k',
        million: 'm',
        billion: 'b',
        trillion: 't'
    },

    currency: {
        symbol: '$'
    }
});
