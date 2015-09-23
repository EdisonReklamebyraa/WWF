var Arbiter = require('arbiter-subpub');
var RES = require('./res.js');
var EnergyScenario = require('./energyScenario.js');

var _ = require("lodash");

module.exports = Data;

function Data(data) {
    this.load();
}

Data.prototype = _.create(
    Data.prototype,
    {
        data: null,

        load: function(json) {
            var _self = this;
            $.getJSON( "/data.json",function(json) {
                _self.update(json);
            }).fail(function(jqxhr, textStatus, error ) {
                var err = textStatus + ", " + error;
            });
        },

        update: function(json) {
            this.data = json.data;
            Arbiter.publish("update/user", json.user);
            Arbiter.publish("update/mix", json.electricity_mix);
            Arbiter.publish("update/background", json.background);
            Arbiter.publish("update", json);
        }
    });
