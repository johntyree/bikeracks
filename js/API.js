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


    function updateRackPhoto(rack_id, base64Image, callback) {
        imgurUpload(base64Image, function uploadCallback(data) {
            var url = Config.updateRackURL;
            var queryParams = {
                rack_id: rack_id,
                url: data.link
            };
            $.post(url, queryParams, function(json) {
                callback && callback($.extend({resp: json}, queryParams, data));
            });
        });
    }


    function imgurUpload(base64Image, callback) {
        if (callback === undefined) {
            console.log('Refusing to upload without callback.');
            return;
        }
        var authorization = 'Client-ID ' + Config.imgurClientID;

        $.ajax({
            url: 'https://api.imgur.com/3/image',
            method: 'POST',
            headers: {
                Authorization: authorization,
                Accept: 'application/json'
            },
            data: {
                image: base64Image.slice(base64Image.indexOf(',') + 1),
                type: 'base64'
            },
            success: function(result) {
                callback({
                    link: result.data.link,
                    id: result.data.id
                });
            }
        });
    }


    return {
        withJSON: withJSON,
        withNearbyRacksJSON: withNearbyRacksJSON,
        updateRackPhoto: updateRackPhoto
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
