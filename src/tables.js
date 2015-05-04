var _ = require("lodash");
module.exports = Tables;

function Tables(data) {

}

Tables.prototype = _.create(
    Tables.prototype,
    {
        backgroundData: null,
        eMixData: null,
        userData: null,

        load: function(json) {
            this.backgroundData = json.background;
            this.eMixData = json.electricity_mix;
            this.userData = json.user;
        },

        init: function() {
            var container = document.getElementById('UserData');
            var UDhot = new Handsontable(container,
                                       {
                                           data: this.userData
                                       });


            var container = document.getElementById('BackgroundData');
            var BDhot = new Handsontable(container,
                                       {
                                           data: this.backgroundData
                                       });

            var emix = document.getElementById('EMix');
            var EMDhot = new Handsontable(emix,
                                       {
                                           data: this.eMixData.data
                                       });

            window.UDhot = UDhot;

            debugger;




        }

    });
