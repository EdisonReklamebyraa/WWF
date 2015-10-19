var Arbiter = require('arbiter-subpub');
var _ = require("lodash");

module.exports = ElectricityDataTable;

function ElectricityDataTable(data) {

    var self = this;

    Arbiter.subscribe("update/mix",function(json) {
        self.loadData(json);
    } );

  $(".accordion").click(_.debounce(function() {
        if(self.table)
          self.table.render();
    }, 100));


  $("#DownloadEMixData").click(function(e) {
        e.preventDefault();
        var blob = new Blob([  handsontable2csv.string(this.table) ], {type: "text/plain;charset=utf-8"});
        saveAs(blob, "Electricity Data Table.tsv");
    }.bind(this));

}

ElectricityDataTable.prototype = _.create(


    ElectricityDataTable.prototype,
    {
        data: null,
        table: null,

        loadData: function(json) {
            this.data = json;
            this.updateTable();
        },

        updateTable:
        _.debounce(function() {
            var self = this;
            if(!this.table){
                var container = document.getElementById('EMix');
                this.table = new Handsontable(container, {
                    data: this.data.data,
                    rowHeaders: false,
                    colHeaders: _.union(["year"], this.data.cols),
                    stretchH: "all",
                    columns: [
                        {type: 'numeric', format: '0'},
                        {type: 'numeric', format: '0 000,00'},
                        {type: 'numeric', format: '0 000,00'},
                        {type: 'numeric', format: '0 000,00'},
                        {type: 'numeric', format: '0 000,00'},
                        {type: 'numeric', format: '0 000,00'},
                        {type: 'numeric', format: '0 000,00'},
                        {type: 'numeric', format: '0 000,00'},
                        {type: 'numeric', format: '0 000,00'},
                        {type: 'numeric', format: '0 000,00'},
                        {type: 'numeric', format: '0 000,00'},
                        {type: 'numeric', format: '0 000,00'}],
                    contextMenu: true
                });

                this.table.addHook('afterChange', function(col, type) {

                    if(type == "edit"){
                        self.data = this.getData()
                        Arbiter.publish("edit/mix", self.data);
                    }
                });
            }
        }, 150)

    });
