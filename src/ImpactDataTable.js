var Arbiter = require('arbiter-subpub');
var _ = require("lodash");

module.exports = ImpactDataTable;

function ImpactDataTable() {

    var self = this;

    Arbiter.subscribe("changed/impact",function(json) {
        self.loadData(json);
    } );


    Arbiter.subscribe("update/user", function(json) {

        self.loadUser(json);
    });


    $(".accordion").click(
        _.debounce(function() {
            if(self.table)
              self.table.render();
        }, 100));


    $("#DownloadImpactData").click(function(e) {
        e.preventDefault();
        var blob = new Blob([JSON.stringify(self.data, null, 4)], {type: "text/plain;charset=utf-8"});
        saveAs(blob, "impact.json");
    });

}

ImpactDataTable.prototype = _.create(

    ImpactDataTable.prototype,
    {
        data: null,
        table: null,
        userData: null,


        loadData: function(json) {
            this.data = json;
            this.updateTable();
        },

        loadUser: function(json) {

            this.userData = json;
            this.updateTable();
        },

        getData: function() {
            var start =  this.userData["starting year"];
            var out = {cols:[], data: []};
            var row  = [];

            for(var i = 0; i < this.data.yearlyTotalPowerGeneration.length; i++)
            {

                row.push(this.data.yearlyTotalPowerGeneration[i]);


                if(i%5 === 4 ){
                    out.data.push(row);
                    row = [];

                }
            }

            out.data.push(row);
            return out;
        },

        updateTable:  _.debounce(function() {
                          var self = this;

                          if(!this.data)
                            return;

                          var container = document.getElementById('ImpactDataTable');
                          var d = this.getData();
                          container.innerHTML = "";
                          this.table = new Handsontable(container, {
                              data: d.data,
                              cells: function(row,cell,prop) {
                                  this.type = "numeric";
                                  this.format = "0 a"
                              }


                          });

                      }, 200)

    });
