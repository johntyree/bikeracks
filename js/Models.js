var Models = (function($, Config, Models) {

    var defaults = {
        photo: ''
    };


    function Rack(config) {
        $.extend(this, defaults, config);
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
