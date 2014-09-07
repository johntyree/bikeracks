var Config = (function() {

    var rootURL = 'http://john.bitsurge.net/bikeracks';
    var imageURL = '/static/images';
    return {

        // API
        nearbyRacksURL: '/static/data/austin_racks_v1.json',
        updateRackURL: rootURL + '/cgi-bin/bikeracks.py',
        getRackURL: rootURL + '/get/',

        // Imgur API
        imgurClientID: 'f962410f5a6a13d',

        rackIconOptions: {
            iconUrl: imageURL + '/parking_bicycle_0.png',
            shadowUrl: imageURL + '/parking_bicycle_shadow_0.png',
            clusterIconUrl: imageURL + '/parking_bicycle_cluster_0.png',
            clusterShadowUrl:
                imageURL + '/parking_bicycle_cluster_shadow_0.png',
            iconAnchor: [13, 32],
            popupAnchor: [5, -24]
        },

        markerClusterOptions: {
            maxClusterRadius: 30
        },

        geoOptions: {
            enableHighAccuracy: true
        },

        // Map view config
        defaultZoom: 14

    };
})();
