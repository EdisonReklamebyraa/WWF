var Arbiter = require('arbiter-subpub');
var RES = require('./res.js');
var EnergyScenario = require('./energyScenario.js');

var _ = require("lodash");

module.exports = Data;

function Data(data) {
    this.init();


}

Data.prototype = _.create(
    Data.prototype,
    {
        data: null,
        investments: null,
        annualGrowthRates: null,

        init: function() {
            var localData = JSON.parse(localStorage.getItem("data"));

            if(localData && localData.user && localData.electricity_mix){
                this.update(localData);
                this.reLoadAnnualGrowthRates();
                this.reLoadInvestments();

            }else{
                localStorage.removeItem("data");
                this.load();
            }

            this.loadEvents();
        },

        loadEvents: function() {
            var _self = this;

            Arbiter.subscribe("changed/user",function(json) {
                _self.changeUser(json);
            } );

            Arbiter.subscribe("edit/mix",function(json) {
                _self.changeEmix(json);

            } );

            Arbiter.subscribe("edit/background",function(json) {
                _self.changeBackground(json);
            } );

            Arbiter.subscribe("edit/investments",function(json) {
                _self.changeInvestments(json);
            } );

            Arbiter.subscribe("edit/annualGrowthRates",function(json) {
                _self.changeAnnualGrowthRates(json);
            } );

            Arbiter.subscribe("reset",function(json) {
                _self.clear();
            } );

        },

        reLoadInvestments: function() {
            var investments = JSON.parse(localStorage.getItem("investments"));

            if(investments){
                Arbiter.publish("edit/investments", investments);
            }else{
                localStorage.removeItem("investments");
            }
        },

        reLoadAnnualGrowthRates: function() {
            var annualGrowthRates = JSON.parse(localStorage.getItem("annualGrowthRates"));

            if(annualGrowthRates){
                Arbiter.publish("edit/annualGrowthRates", annualGrowthRates);
            }else{
                localStorage.removeItem("annualGrowthRates");
            }
        },

        save: function() {

            localStorage.setItem("data",JSON.stringify(this.data));

            if(this.investments)
              localStorage.setItem("investments",this.investments);


            if(this.annualGrowthRates)
              localStorage.setItem("annualGrowthRates",this.annualGrowthRates);

            Arbiter.publish("saving", this);

        },

        load: function() {
            var _self = this;
            $.getJSON( "/data.json",function(json) {
                _self.update(json);
                _self.save();
            }).fail(function(jqxhr, textStatus, error ) {
                var err = textStatus + ", " + error;
            });
        },


        changeUser: function(json) {
            this.data.user = json;
            this.save();
        } ,

        changeEmix : function(json) {
            this.data.electricity_mix = json;
            this.save();

        } ,

        changeBackground : function(json) {
            this.data.background = json;
            this.save();
        } ,

        changeInvestments : function(json) {
            this.investments = json;
            this.save();
        } ,

        changeAnnualGrowthRates : function(json) {
            this.annualGrowthRates = json;
            this.save();
        } ,

        clear: function() {
            this.data= null;
            this.investments= null;
            this.annualGrowthRates= null;
            this.load();
        },

        update: function(json) {
            this.data = json;

            Arbiter.publish("update/user", json.user);
            Arbiter.publish("update/mix", json.electricity_mix);
            Arbiter.publish("update/background", json.background);
            Arbiter.publish("update", json);
        }
    });
