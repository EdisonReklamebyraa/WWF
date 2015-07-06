var Arbiter = require('arbiter-subpub');
var _ = require("lodash");

module.exports = BackgroundDataTable;

function BackgroundDataTable(data) {

    var self = this;

    Arbiter.subscribe("update/background",function(json) {
        self.loadData(json);
    } );

    $(".accordion").click(_.debounce(function() {
        if(self.table)
          self.table.render();
    }, 100));
}

BackgroundDataTable.prototype = _.create(

    BackgroundDataTable.prototype,
    {
        data: null,
        table: null,

        loadData: function(json) {
            this.data = json;
            this.updateTable();
        },

        updateTable:  _.debounce(function() {
                          var self = this;
                          if(!this.table){

                              var container = document.getElementById('BackgroundData');
                              this.table = new Handsontable(container, {
                                  data: this.data,
                                  rowHeaders: false,
                                  colHeaders: ["IPCC 2014<hr>Res Technologies",
                                               "Lifetime <hr>years",
                                               "Overnight capital cost <hr>USD 2011 / kW",
                                               "&nbsp;<hr>Min hours",
                                               "<div class='wide'>Full Load Hours (capacity)</div><hr> Max hours",
                                               "&nbsp;<hr>Average hours",
                                               "Emissions <hr> LCA life-cycle assessment<hr>grams CO2eq/kWh",
                                               "Employment <hr>Jobs / GWh",
                                               "Employment <hr>Jobs / 1 million $" ],

                                  stretchH: "all",
                                  contextMenu: true,
                                  cells: function(row,cell,prop) {
                                      switch(cell) {
                                          case 0:
                                          break;
                                          case 1:
                                          case 2:
                                          case 3:
                                          case 4:
                                          case 5:
                                          this.type = "numeric";
                                          break;


                                          default:
                                          this.format = "0,00.0' a";
                                          this.type = "numeric";
                                      }

                                  }
                              });

                              this.table.addHook('afterChange', function(col, type) {
                                  if(type == "edit"){
                                      self.data = this.getData()
                                      Arbiter.publish("edit/background", self.data);
                                  }
                              });
                          }else{
                              this.table.loadData(self.data);
                          }
                      }, 200)

    });
