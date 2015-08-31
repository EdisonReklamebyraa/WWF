var Arbiter = require('arbiter-subpub');
var _ = require("lodash");

module.exports = ForecastTable;

function ForecastTable(data) {

    var self = this;

    Arbiter.subscribe("changed/user",function(json) {
        self.update();
    } );

  $(".accordion").click(_.debounce(function() {
        if(self.table)
          self.table.render();
    }, 100));

}

ForecastTable.prototype = _.create(


    ForecastTable.prototype,
    {
        data: null,

        updateUserData: function(json) {
            this.data = json;
        },

        update: function(json) {

        }
    });
