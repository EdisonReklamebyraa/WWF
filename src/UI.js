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

    Arbiter.subscribe("changed/user", function(json) {
        self.update(json);
        self.updateUI(json);
    });

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
            $("input[name=totalFund]").val(numeral(this.user["investment"] ).format('$ 0, 000')  );
            $("input[name=endYear]").val(this.user["target year"] );
            $("input[name=investPercentage]").val(numeral(this.user["target"] ).format('0%'));
            $("input[name=growthRate]").val(numeral(this.user["annual growth rate"] ).format('0%'));
        },

        loadEvents: function(e) {
            self = this;
            $(".upndownBox .downBtn").click(function(e) {
                e.preventDefault();
                var p = $(this).parent();
                var t = $("input[name="+p.data("target")+"]");
                var val = Math.max(numeral().unformat(p.data("min")) ,numeral().unformat(t.val()) - p.data("inc"));
                t.val( val );
                self.interaction(t);
            });

            $(".upndownBox .upBtn").click(function(e) {
                e.preventDefault();
                var p = $(this).parent();
                var t = $("input[name="+p.data("target")+"]");
                var val = Math.max(numeral().unformat(p.data("min")) , numeral().unformat(t.val()) + p.data("inc"));
                t.val( val );
                self.interaction(t);
            });

            $("input").focusout(function() {
                self.interaction(this);
            }).change(function() {
                self.interaction(this);
            }).focus(function() {
                if(!$(this).hasClass("string"))
                  $(this).val(numeral().unformat($(this).val()));
            });
        },

        interaction: function(input) {

            this.user[ $(input).data("id")] = $(input).val() * 1;


            this.user["target year"] = Math.max(this.user["target year"], this.user["starting year"])

            Arbiter.publish("changed/user",this.user);
        }


    });
