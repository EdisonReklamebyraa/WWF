var Arbiter = require('arbiter-subpub');
var _ = require("lodash");

module.exports = ComparisonsTable;

function ComparisonsTable(data) {

    var self = this;
    Arbiter.subscribe("update/user",function(json) {
        self.loadData(json);
    } );

    $(".accordion").click(_.debounce(function() {
        if(self.table)
          self.table.render();
    }, 100));

}

ComparisonsTable.prototype = _.create(

    ComparisonsTable.prototype,
    {
        data: null,
        table: null,

        loadData: function(json) {
            this.data = json;
            this.updateTable();
        },

        getData: function() {

           return  [[ "Nuclear reactor, capacity average (2015)",	"MW",	this.data["nuclearReactor"],	"World Nuclear Association"],
           [ "Coal power generator, capacity, average (2013)",	"MW",	this.data["coalPlant"],	"EPA (see background info)"],
           [ "United States electricity generation (2011)",	"TWh",	this.data["US"],	"IEA 2014"],
           [ "European Union, electricity consumption per capita (2011)",	"kWh",	this.data["EUCitizens"],	"World Bank"],
           [ "World annual GHG emissions, incl. LUCF(2012)",	"Mt CO2 eq.",	this.data["worldGHG"],	"World resource Institute"],
           [ "US annual GHG emissionS, INCL. LUCF (2011)",	"Mt CO2 eq.",	 this.data["worldUS"],	"World resource Institute"]];

        },

        updateUser: function(cell) {


            switch(cell[0]) {
                case 0:
                this.data["nuclearReactor"] = cell[3];
                break;
                case 1:
                this.data["coalPlant"] = cell[3];
                break;
                case 2:
                this.data["US"] = cell[3];
                break;
                case 3:
                this.data["EUCitizens"] = cell[3];
                break;
                case 4:
                this.data["worldGHG"] = cell[3];
                break;
                case 5:
                this.data["worldUS"] = cell[3];
                break;
            }

             Arbiter.publish("changed/user",this.data);

        },

        updateTable:  _.debounce(function() {
                          var self = this;

                          if(!this.table){
                              var container = document.getElementById('ComparisonsTable');
                              this.table = new Handsontable(container, {
                                  data: this.getData(),
                                  rowHeaders: false,
                                  colHeaders: ["Indicator",	"Unit",	"Value", "Source"],
                                  stretchH: "all",
                                  contextMenu: true,
                                  cells: function(row,cell,prop) {
                                      if(cell == 2) {

                                          this.format = "0, 000";
                                          this.type = "numeric";
                                      }else{
                                          this.readOnly = true;
                                      }
                                  }
                              });

                              this.table.addHook('afterChange', function(cols, type) {
                                  if(type == "edit"){
                                      for(var i = 0; i < cols.length; i++)
                                      {
                                          self.updateUser(cols[i]);
                                      }
                                  }
                              });
                          }else{
                              this.table.loadData(self.data);
                          }
                      }, 200)

    });
