MapView = (function($, L, Models, Config) {

    var defaults = {

        display: Config.display,

        rackLayer: L.layerGroup(),

        rackIcon: {
            icon: 'static/images/parking_bicycle.png',
            shadow: 'static/images/parking_bicycle_shadow.png'
        },

        geoOptions: {
            enableHighAccuracy: true
        },

        // Initial zoom level
        defaultZoom: Config.defaultZoom

    };


    var MapView = function MapView(config) {
        var self = this;

        $.extend(self, defaults, config);

        self.rackIcon = new L.Icon.Default({
            iconUrl: self.rackIcon.icon,
            shadowUrl: self.rackIcon.shadow,
            iconSize: [32, 37]
        });

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
        self.zoomToUser();

        self.rackLayer.addTo(self.map);

    };


    MapView.prototype.zoomToUser = function zoomToUser() {
        var self = this;

        navigator.geolocation && navigator.geolocation.getCurrentPosition(
            function(position) {
                zoomToPosition(position, self.map);
                self.redraw();
            },
            function(error) {console.log(error);},
            self.geo_options);
    };


    MapView.prototype.redraw = function redraw() {
        var self = this;

        var options = self.map.getCenter();
        self.rackSource.withNearbyRacks(options,
            function placeRacks(racks) {
                var markers = L.layerGroup();
                for (var i = 0, len = racks.length; i < len; i++) {
                    var marker = L.marker([racks[i].lat, racks[i].lng]);
                    marker.bindPopup(popupForRack(racks[i]));
                    marker.setIcon(self.rackIcon);
                    markers.addLayer(marker);
                }
                self.rackLayer.clearLayers();
                self.rackLayer.addLayer(markers);
            }
        );
    };


    return {
        mapView: function mapView(config) { return new MapView(config); }
    };


    function popupForRack(rack) {
        return rack.addr;
    }

    function zoomToPosition(position, map) {
        var lat = position.coords.latitude;
        var lng = position.coords.longitude;
        map.setView([lat, lng], 14);
    }


}(jQuery, L, Models, Config));
