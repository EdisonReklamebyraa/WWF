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



    $("#DownloadSharesDataData").click(function(e) {
                                     e.preventDefault();
        var blob = new Blob([JSON.stringify(self.data, null, 4)], {type: "text/plain;charset=utf-8"});
        saveAs(blob, "Key results.json");
    });
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

            var start =  this.userData["starting year"];
            var cols = _.map(new Array(200), function(val, i){return start + i });
            cols.unshift("");
            var out = {cols:cols, data: [], format: []};
            var rows = [];
            var format = [] ;
            var inc = 1;
            var clump = 7;


            for(var i = 0; i < this.data.length; i++)
            {
                var members = this.data[i].members;

                for(var j = 0; j < members.length; j++)
                {
                    var member = members[j];
                    var index = clump * j;

                    for(var k = 0; k <  clump; k++)
                    {
                        if(!rows[index + k ]){
                            rows[index + k] = [];
                            format[index + k]  = [] ;
                        }
                    }

                    rows[index][i+1] = "";
                    rows[index][0] = "<strong>" +  member.title.charAt(0).toUpperCase() + member.title.slice(1)+ "</strong>";
                    rows[index + 1][0] = "Annual investment (USD)";
                    rows[index + 2][0] = "Electricity output, annual (kWh)";
                    rows[index + 3][0] = "Electricity output, lifetime (kWh)";
                    rows[index + 4][0] = "Installed capacity (kW)";
                    rows[index + 5][0] = "<strong>" +  member.title.charAt(0).toUpperCase() + member.title.slice(1)+ "'s</strong>" + " share of investment";

                    rows[index+1][i+1] = member.money;
                    rows[index+2][i+1] = member.annualOutput;
                    rows[index+3][i+1] = member.lifetimeOutput;
                    rows[index+4][i+1] = member.installed;
                    rows[index+5][i+1] = member.percent;

                    format[index][i] = { };
                    format[index][i+1] = { };
                    format[index][0] = { renderer: "html"};
                    format[index + 1][0] = { };
                    format[index + 2][0] = { };
                    format[index + 5][0] = {renderer: "html"};

                    format[index+1][i+1] = {type: "numeric", format: "$ 0, 000"};
                    format[index+2][i+1] = {type: "numeric", format: "0, 000"};
                    format[index+3][i+1] = {type: "numeric", format: "0, 000 "};
                    format[index+4][i+1] = {type: "numeric", format: "0, 000.00"};
                    format[index+5][i+1] = {type: "numeric", format: "%"};
                }


            }
            out.format = format;
            out.data = rows;

            return out;
        },

        updateTable:  _.debounce(function() {
                          var self = this;

                          if(!this.data || !this.userData)
                            return;


                          var container = document.getElementById('SharesDataTable');
                          var d = this.getData();

                          container.innerHTML = "";
                          this.table = new Handsontable(container, {
                              data: d.data,
                              stretchH: "all",
                              colHeaders: d.cols,
                              contextMenu: true,
                              cells: function(row,cell,prop) {
                                  _.assign(this,d.format[row][cell] );
                              }
                          });

                          this.table.addHook('afterChange', function(col, type) {
                              if(type == "edit"){
                                  self.data = this.getData();
                                  Arbiter.publish("edit/shares", self.data);
                              }
                          });

                      }, 200)

    });
