var Arbiter = require('arbiter-subpub');
var _ = require("lodash");

module.exports = UIs;

function UIs(data) {
    var self = this;

    this.loadEvents();
    Arbiter.subscribe("update/user",function(json) {
        self.update(json);
        self.updateUI(json);
    } );
}

UIs.prototype = _.create(
    UIs.prototype,
    {

        user: null,
        update: function(json) {
            this.user = json;
        },

        updateUI: function(json) {
            $("input[name=startYear]").val(this.user["starting year"] );
            $("input[name=endYear]").val(this.user["target year"] );
            $("input[name=investPercentage]").val(numeral(this.user["target"] ).format('0%'));
        },

        loadEvents: function(e) {
            $(".upndownBox .downBtn").click(function(e) {
                e.preventDefault();
                var p = $(this).parent();
                var t = $("input[name="+p.data("target")+"]");
                t.val( numeral(numeral().unformat(t.val()) - p.data("inc")).format(p.data("format"))  );
            });
            $(".upndownBox .upBtn").click(function(e) {
                e.preventDefault();
                var p = $(this).parent();
                var t = $("input[name="+p.data("target")+"]");
                t.val( numeral(numeral().unformat(t.val()) + p.data("inc")).format(p.data("format"))  );
            });
        }
    });
