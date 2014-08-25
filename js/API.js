API = (function(Config, $) {

    // var _json = {};

    function withJSON(url, callback) {
        // if (_json[url] == undefined) {
            $.getJSON(url, function(json) {
                // _json[url] = json;
                callback(json);
            });
        // } else {
            // callback(_json[url]);
        // }
    }

    function withNearbyRacksJSON(options, callback) {
        withJSON(urlForNearbyRacks(options), callback);
    }


    return {
        withJSON: withJSON,
        withNearbyRacksJSON: withNearbyRacksJSON
    };


    // Private functions

    function urlForNearbyRacks(options) {
        url = Config.nearbyRacksURL;
        var query = $.query
                     .set('lat', options.lat)
                     .set('lng', options.lng);
        return url + query;
    }

}(Config, jQuery));
