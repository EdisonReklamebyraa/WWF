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
            self = this;

            $(".upndownBox .downBtn").click(function(e) {
                e.preventDefault();
                var p = $(this).parent();
                var t = $("input[name="+p.data("target")+"]");
                var val = Math.max(numeral().unformat(p.data("min")) ,numeral().unformat(t.val()) - p.data("inc"));
                t.val(  numeral(val).format(p.data("format")) );
                self.interaction();
            });

            $(".upndownBox .upBtn").click(function(e) {
                e.preventDefault();
                var p = $(this).parent();
                var t = $("input[name="+p.data("target")+"]");
                var val = Math.max(numeral().unformat(p.data("min")) , numeral().unformat(t.val()) + p.data("inc"));
                t.val(  numeral(val).format(p.data("format") ) );
                self.interaction();
            });

            $("input").change(function() {
                self.interaction();
            });
        },


        interaction: function() {
            this.user["starting year"] = Math.max(2013,numeral().unformat($("input[name=startYear]").val()));
            this.user["target year"] = Math.max(2013,this.user["starting year"] + 1 ,numeral().unformat($("input[name=endYear]").val()));
            this.user["target"] = numeral().unformat($("input[name=investPercentage]").val());
            this.updateUI();
            Arbiter.publish("changed/user",this.user);
        }


    });
