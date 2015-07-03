var Arbiter = require('arbiter-subpub');
var _ = require("lodash");

module.exports = SharesDataTable;

function SharesDataTable() {

    var self = this;

    Arbiter.subscribe("update/shares",function(json) {
        self.loadData(json);
    } );
    Arbiter.subscribe("update/user", function(json) {

        self.loadUser(json);
    });
    Arbiter.subscribe("update", function(json) {
        self.loadUser(json.user);
    });

    $(".accordion").click(_.debounce(function() {
        if(self.table)
          self.table.render();
    }, 100));
}

SharesDataTable.prototype = _.create(

    SharesDataTable.prototype,
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
            var out = {cols: [""], data: []};


            var rows = [];
            var inc = 1;
            var clump = 5;


            for(var i = 0; i < this.data.length; i++)
            {
                var members = this.data[i].members;


                out.cols.push(this.userData["starting year"] + i);



                for(var j = 0; j < members.length; j++)
                {

                    var member = members[j];
                    var index = clump * j;


                    for(var k = 0; k <  clump; k++)
                    {
                        if(!rows[index + k ])
                          rows[index + k] = [];
                    }


                    rows[index][i] = "";
                    rows[index][i+1] = "";

                    rows[index][0] = member.title;

                    rows[index + 1][0] = "investments";
                    rows[index + 2][0] = "annual Output";
                    rows[index + 3][0] = "lifetime Output";


                    rows[index+1][i+1] = member.money;
                    rows[index+2][i+1] = member.annualOutput;
                    rows[index+3][i+1] = member.lifetimeOutput;
                }


            }
            out.data = rows;

            return out;
        },

        updateTable:  _.debounce(function() {
            var self = this;

            if(!this.data)
              return;

            if(!this.table){
                var container = document.getElementById('SharesDataTable');
                var d = this.getData();
                this.table = new Handsontable(container, {
                    data: d.data,
                    stretchH: "all",
                    colHeaders: d.cols,
                    contextMenu: true,
                    cells: function(row,cell,prop) {

                        if(cell > 0){
                            this.type = "numeric";
                            this.format = "000.000 a";
                        }
                    }
                });

                this.table.addHook('afterChange', function(col, type) {
                    if(type == "edit"){
                        self.data = this.getData();
                        Arbiter.publish("edit/shares", self.data);
                    }
                });
            }else{
                var d = this.getData();
                this.table.loadData(d.data);
            }
        }, 200)

    });
