var Arbiter = require('arbiter-subpub');
var _ = require("lodash");

module.exports = Tables;

function Tables(data) {
    this.load();
}

Tables.prototype = _.create(
    Tables.prototype,
    {
        backgroundData: null,
        eMixData: null,
        userData: null,

        load: function(json) {
            var _self = this;
            $.getJSON( "/data.json",function(json) {
                _self.update(json);
            }).fail(function(jqxhr, textStatus, error ) {
                var err = textStatus + ", " + error;
            });
        },

        update: function(json) {


            Arbiter.publish("update", json);

            Arbiter.publish("update/user", json.user);
            var UDhot = new Handsontable(document.getElementById("UserData"), {
                                           data: json.user
                                       });


            Arbiter.publish("update background", json.background);
            var BDhot = new Handsontable(document.getElementById('BackgroundData'), {
                                           data: json.background
                                       });

            Arbiter.publish("update mix", json.emix);
            var EMDhot = new Handsontable(document.getElementById("EMix"), {
                                           data: json.emix
                                       });
        }

    });
