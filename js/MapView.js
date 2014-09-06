MapView = (function($, L, Models, Config) {

    var defaults = {

        display: Config.display,

        rackLayer: L.markerClusterGroup(),

        // .icon and .shadow urls
        rackIconOptions: Config.rackIconOptions,

        markerClusterOptions: Config.markerClusterOptions,

        geoOptions: Config.geoOptions,

        // Initial zoom level
        defaultZoom: Config.defaultZoom

    };


    var MapView = function MapView(config) {
        var self = this;

        $.extend(self, defaults, config);

        self.rackIcon = new L.Icon(self.rackIconOptions);
        // self.rackIcon = new L.Icon.Default();

        self.rackSource = Models.rackSource();

        var mapboxTiles = new L.StamenTileLayer('terrain', {
            attribution: self.attribution,
            maxZoom: self.maxZoom,
            minZoom: self.minZoom
        });

        // Leaflet map object
        self.map = L.map('map', {center: [30.267812, -97.745525],
                                 zoom: self.defaultZoom,
                                 layers: [mapboxTiles]});
        self.redraw();

        $.extend(self.rackLayer.options,
                 {iconCreateFunction: iconCreateFunction(self.rackIcon.options)},
                 self.markerClusterOptions);

        self.rackLayer.addTo(self.map);

        self.zoomToUser({redraw: false});

    };


    MapView.prototype.zoomToUser = function zoomToUser(options) {
        var self = this;

        navigator.geolocation && navigator.geolocation.getCurrentPosition(
            function(position) {
                zoomToPosition(position, self.map);
                options.redraw && self.redraw();
            },
            function(error) {console.log(error);},
            self.geo_options);
    };


    MapView.prototype.redraw = function redraw() {
        var self = this;

        var options = self.map.getCenter();
        self.rackSource.withNearbyRacks(options,
            function placeRacks(racks) {
                var len = racks.length;
                var markers = new Array(len);
                for (var i = 0; i < len; i++) {
                    var marker = L.marker([racks[i].lat, racks[i].lng]);
                    marker.bindPopup(racks[i].popUp());
                    marker.setIcon(self.rackIcon);
                    markers[i] = marker;
                }
                self.rackLayer.clearLayers();
                self.rackLayer.addLayers(markers);
            }
        );
    };


    return {
        mapView: function mapView(config) { return new MapView(config); }
    };


    function zoomToPosition(position, map) {
        var lat = position.coords.latitude;
        var lng = position.coords.longitude;
        map.setView([lat, lng], 14);
    }


    function iconCreateFunction(options) {
        return function iconCreateFunction(cluster) {

            var childCount = cluster.getChildCount();

            var c = ' marker-cluster-';
            if (childCount < 4) {
                c += 'small';
            } else if (childCount < 10) {
                c += 'medium';
            } else {
                c += 'large';
            }
            var html =
                '<div class="marker-cluster-shadow">' +
                    '<img src="' + options.clusterShadowUrl + '"></img>' +
                '</div>' +
                '<img src="' + options.clusterIconUrl + '"></img>' +
                '<div class="marker-cluster-flair' + c + '">' +
                    '<span>' + childCount + '</span>' +
                '</div>';

            var icon = new L.DivIcon({
                html: html,
                className: 'marker-cluster',
                iconSize: new L.Point(37, 26)
            });
            return icon;
        };
    };

}(jQuery, L, Models, Config));
