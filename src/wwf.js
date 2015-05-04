var _ = require('lodash');

var EnergyScenario = require('./energyScenario.js');
var RES = require('./res.js');

var Tables = require("./tables.js");
var _ = require("lodash");


module.exports = WWF;

function WWF() {

    this.tables = new Tables();
    this.loadData();

}


WWF.prototype = _.create(WWF.prototype, {

    tables: null,

    loadData: function() {
        var _self = this;

        $.getJSON( "/data.json",function(json) {
            _self.tables.load(json);
            _self.tables.init();
        }).fail(function(jqxhr, textStatus, error ) {
            var err = textStatus + ", " + error;
            console.log( "Request Failed: " + err );
        });
    }







});
