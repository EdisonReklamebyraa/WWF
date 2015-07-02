var Arbiter = require('arbiter-subpub');
var _ = require("lodash");

module.exports = InvestmentDataTable;

function InvestmentDataTable() {

    var self = this;


    Arbiter.subscribe("update/investments",function(json) {

        self.loadData(json);
    } );

    Arbiter.subscribe("update/user", function(json) {

        self.loadUser(json);
    });
    Arbiter.subscribe("update", function(json) {
        self.loadUser(json.user);
    });


}

InvestmentDataTable.prototype = _.create(

    InvestmentDataTable.prototype,
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

        tableData: function() {
            return [this.data];
        },

        updateTable: function() {
            var self = this;


            if(!this.data)
              return;

            if(!this.table){
                var container = document.getElementById('InvestmentDataTable');
                var colHeaders = [];

                for(var i = this.userData["starting year"]; i <= this.userData["target year"]; i++)
                {
                    colHeaders.push(i);
                }

                this.table = new Handsontable(container, {
                    data: self.tableData(),
                    stretchH: "all",
                    colHeaders: true,
                    colHeaders: colHeaders,
                    contextMenu: true,
                    cells: function(row,cell,prop) {
                        this.type = "numeric";
                        this.format = "000.000 a"
                    }
                });

                this.table.addHook('afterChange', function(col, type) {
                    if(type == "edit"){
                        self.data = this.getData()[0];
                        Arbiter.publish("edit/investments", self.data);
                    }
                });
            }else{
                this.table.loadData(self.tableData());
            }
        }

    });