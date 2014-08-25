
var Config = {

    // API
    nearbyRacksURL: '/static/data/bike_racks_geocodes.json',

    rackIconOptions: {
        iconUrl: 'static/images/parking_bicycle_0.png',
        shadowUrl: 'static/images/parking_bicycle_shadow_0.png',
        clusterIconUrl: 'static/images/parking_bicycle_cluster_0.png',
        clusterShadowUrl: 'static/images/parking_bicycle_cluster_shadow_0.png',
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
