var Arbiter = require('arbiter-subpub');
var _ = require("lodash");

module.exports = BackgroundDataTable;

function BackgroundDataTable(data) {

    var self = this;

    Arbiter.subscribe("update/background",function(json) {
        self.loadData(json);
    } );
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
                                  rowHeaders: true,
                                  colHeaders: ["type",
                                               "years",
                                               "overnight capital cost",
                                               "min hours",
                                               "max hours",
                                               "average hours",
                                               "emissions",
                                               "employment a",
                                               "employment b" ],

                                  stretchH: "all",
                                  contextMenu: true,
                                  cells: function(row,cell,prop) {

                                      if(cell > 1 && cell != 2){
                                          this.type = "numeric";
                                          this.format = "0,00.0' a";
                                      }

                                      else if(cell === 1 || cell === 2){
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
