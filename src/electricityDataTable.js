var Arbiter = require('arbiter-subpub');
var _ = require("lodash");

module.exports = ElectricityDataTable;

function ElectricityDataTable(data) {

    var self = this;

    Arbiter.subscribe("update/mix",function(json) {
        self.loadData(json);
    } );
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


        updateTable: function() {
            var self = this;

            if(!this.table){

                var container = document.getElementById('EMix');
                this.table = new Handsontable(container, {
                    data: this.data.data,
                    rowHeaders: true,
                    colHeaders: _.union(["year"], this.data.cols),
                    stretchH: "all",
                    columns: [{type: 'numeric', format: '0'}, {type: 'numeric', format: '0,0.00 a'},{type: 'numeric', format: '0,0.00 a'},{type: 'numeric', format: '0,0.00 a'}, {type: 'numeric', format: '0,0.00 a'},{type: 'numeric', format: '0,0.00 a'},{type: 'numeric', format: '0,0.00 a'}, {type: 'numeric', format: '0,0.00 a'},{type: 'numeric', format: '0,0.00 a'},{type: 'numeric', format: '0,0.00 a'}, {type: 'numeric', format: '0,0.00 a'},{type: 'numeric', format: '0,0.00 a'}],
                    contextMenu: true
                });

                this.table.addHook('afterChange', function(col, type) {

                    if(type == "edit"){
                        self.data = this.getData()
                        Arbiter.publish("edit/mix", self.data);
                    }
                });


            }
        }

    });
