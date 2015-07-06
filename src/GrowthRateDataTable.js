var Arbiter = require('arbiter-subpub');
var _ = require("lodash");

module.exports = GrowthRateDataTable;

function GrowthRateDataTable() {

    var self = this;


    Arbiter.subscribe("update/growthRates",function(json) {

        self.loadGrowthRates(json);
    } );


    Arbiter.subscribe("update/investments",function(json) {

        self.loadData(json);
    } );

    Arbiter.subscribe("update/projections",function(json) {

        self.loadProjections(json);
    } );

    Arbiter.subscribe("update/user", function(json) {

        self.loadUser(json);
    });

    Arbiter.subscribe("update", function(json) {
        self.loadUser(json.user);
    });

    $(".accordion").click(
        _.debounce(function() {
            if(self.table)
              self.table.render();
        }, 100));

}

GrowthRateDataTable.prototype = _.create(

    GrowthRateDataTable.prototype,
    {
        data: null,
        table: null,
        userData: null,
        projections: null,
        annualGrowthRates: null,

        loadData: function(json) {
            this.data = json;
            this.updateTable();
        },

        loadProjections: function(json) {

            this.projections = json;
            this.updateTable();
        },

        loadUser: function(json) {

            this.userData = json;
            this.updateTable();
        },

        loadGrowthRates: function(json) {
            this.annualGrowthRates = json;
            this.updateTable();
        },

        tableData: function() {
            var total = 0;
            var arrData = [];

            for(var i = 0; i < this.data.length; i++)
            {
                total += this.data[i];
                arrData.push([
                    (this.userData["starting year"] + i) ,
                    (i == 0)?this.userData["investment"]:"",
                    this.annualGrowthRates[i],
                    this.projections[i],
                    (i == 0)?this.userData["target"]:"",
                    this.data[i],
                    total
                    ]);
            }

            return arrData;
        },

        updateTable:  _.debounce(function() {
                          var self = this;

                          if(!this.data || !this.userData || !this.projections || !this.annualGrowthRates)
                            return;


                          if(!this.table){
                              var container = document.getElementById('GrowthRateDataTable');
                              var colHeaders = [
                                  "Year",
                                  "Latest size of the investor",
                                  "Expected annual growth rate of the investor",
                                  "Investor's size year by year (can be overriden if the forecast is provided by the investor)",
                                  "Target investment in Res",
                                  "Annual investment",
                                  "Cumulative investments"];



                              this.table = new Handsontable(container, {
                                  data: self.tableData(),
                                  stretchH: "all",
                                  colHeaders: true,
                                  colHeaders: colHeaders,
                                  contextMenu: true,
                                  cells: function(row,cell,prop) {
                                      switch(cell) {
                                          case 0:
                                          this.type = "numeric";
                                          break;
                                          case 2:
                                          case 4:
                                          this.type = "numeric";
                                          this.format = "aaa 0%"
                                          break;
                                          default:
                                          this.type = "numeric";
                                          this.format = "$ 0,000"
                                      }


                                  }
                              });


                              this.table.addHook('afterChange', function(changes, type) {
                                  if(type == "edit"){
                                      var data  = this.getData();
                                      for(var i = 0; i < changes.length; i++)
                                      {
                                          switch(changes[i][1]) {
                                              case 1:
                                              self.updateInvestment(data);
                                              break;
                                              case 2:
                                              self.updateGrowthrate(data);
                                              break;
                                              case 3:
                                              self.updateSizeOfInvestment(changes[i], data);
                                              break;
                                              case 4:
                                              self.updateTarget(data);
                                              break;
                                          }

                                      }
                                  }
                              });

                          }else{
                              this.table.loadData(self.tableData());
                          }
                      }, 200),

        updateInvestment: function(data) {
            this.userData.investment = data[0][1];
            Arbiter.publish("changed/user",this.userData);
        },

        updateGrowthrate: function(data) {
            Arbiter.publish("edit/annualGrowthRates",this.getGrowthrate(data));

        },

        updateSizeOfInvestment: function(change, data) {
            var gr = this.getGrowthrate(data);
            var investment = (change[0] === 0)?this.userData.investment: data[change[0] -1][3];
            gr[change[0]] = (data[change[0]][3] / investment ) - 1;
            Arbiter.publish("edit/annualGrowthRates",gr);
        },
        
        getGrowthrate: function(data) {
            return _.map(data,function(row) {
                return row[2]
            });
        },

        updateTarget: function(data) {
             this.userData.target = data[0][4];
            Arbiter.publish("changed/user",this.userData);
        }



    });
