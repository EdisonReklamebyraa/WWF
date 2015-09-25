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
            var list = "";

            for(var i = 0; i < this.data.yearlyTotalPowerGeneration.length; i++)
            {
                list +="<div class='year'><dt>"
              + ( i + start )
              + ": </dt>"
              +  "<dd>"
              + numeral(this.data.yearlyTotalPowerGeneration[i]).format('0 000')
              + "</dd></div>";
            }

            return list;
        },

        updateTable:  _.debounce(function() {
                          var self = this;

                          if(!this.data)
                            return;

                          $("#ImpactDataTable").html("<dl>"+this.getData()+"</dl>");

                      }, 200)

    });
