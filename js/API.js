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
        var url = Config.nearbyRacksURL;
        var query = buildQuery(options);
        return url + query;
    }


    function buildQuery(options) {
        var q = $.query.EMPTY();
        for (param in Object.getOwnPropertyNames(options)) {
            q.set(param, options[param]);
        }
        return q;
    }

}(Config, jQuery));
