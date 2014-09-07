var Models = (function($, Config, Models) {

    var defaults = {
        id: 0,
        images: [],
        photo: ''
    };


    function Rack(config) {
        $.extend(this, defaults, config);
        if (this.images.length > 0) {
            this.photo = this.images[0];
        }
    };


    Rack.prototype.popUp = function popUp() {
        var self = this;

        var photo = '<div class="hidden" id="rack-img-' + self.id + '">' +
                         '<img src="' + self.photo + '"/></br></div>';
        var photoButton = '<div class="button" id="photoButton"' +
                           'onclick="Utils.takeAPhoto(' + self.id + ')">' +
                           'Take a photo' +
                           '</br></div>';
        var html = photo +
                   photoButton +
                   self.address;
        return html;
    };


    Models.rack = function rack(config) {
        return new Rack(config);
    };

    return Models;

}(jQuery, Config, Models || {}));


var Models = (function($, Config, Models) {

    var defaults = {
    };


    function RackSource(config) {
        $.extend(this, defaults, config);
    };


    RackSource.prototype.withNearbyRacks = function withNearbyRacks(
            options, callback) {
        API.withNearbyRacksJSON(options, function(data) {
            var nPoints = data.length;
            var racks = new Array(nPoints);
            for (var i = 0; i < nPoints; i++) {
                racks[i] = Models.rack(data[i]);
            }
            callback(racks);
        });
    };


    Models.rackSource = function rackSource(config) {
        return new RackSource(config);
    };

    return Models;

}(jQuery, Config, Models || {}));
