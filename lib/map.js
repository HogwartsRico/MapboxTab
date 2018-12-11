var React = require('react');
//require('mapbox.js');
var util = require('./util');
var places = require('gazetteer');
var mapids = require('./mapids');

var Map = React.createClass({

  getInitialState: function() {
    return {
      mapid: this.props.randomMapId,
      geocodeResult: null,
      online: true
    };
  },

  componentDidMount: function() {	   
	var self=this;
    if (!navigator.onLine) return this.setState({online: false});
    util.getCookie('settings', (settings) => {
      if (settings && settings.mapSettings[0].checked) {
        this.setState({ mapid: 'bobbysud.79c006a5' });
      } else if (settings && settings.mapSettings[1].checked) {
        this.setState({ mapid:'bobbysud.j1o8j5bd' });
      } else if (settings && settings.mapSettings[3].checked) {
        this.setState({ mapid: settings.customMapId});
      }
	  /*栅格底图 
	this.map = new maptalks.Map('map', {
        center: [120.14236469269,30.246820640564],
        zoom: 15,
        baseLayer: new maptalks.TileLayer('base', {
          urlTemplate: 'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
          subdomains: ['a','b','c','d']
          
        })
      });
	this.map.removeControl(this.map.attributionControl);//移除版权信息
	*/
	
	mapboxgl.accessToken = 'pk.eyJ1IjoiemhlbmZ1IiwiYSI6ImNpb284bzNoYzAwM3h1Ym02aHlrand6OTAifQ.sKX-XKJMmgtk_oI5oIUV_g';
	var locationNum=Math.floor(Math.random()*self.locations.length);
	var styleNum=Math.floor(Math.random()*self.mapStyles.length);
    var baseLayer = new maptalks.MapboxglLayer('tile',{
        glOptions : {
            'style' : self.mapStyles[styleNum] //'mapbox://styles/mapbox/light-v9'
        }
    }).on('layerload', function () {
        start();
    });

	this.map = new maptalks.Map("map",{
        //limit max pitch to 60 as mapbox-gl-js required
        maxPitch : 60,
        center:   self.locations[locationNum],
        zoom   :  14,
        baseLayer : baseLayer
    });
	this.map.removeControl(this.map.attributionControl);//移除版权信息
	this.chnageView(this.map);
      //L.mapbox.accessToken = 'pk.eyJ1IjoiYm9iYnlzdWQiLCJhIjoiTi16MElIUSJ9.Clrqck--7WmHeqqvtFdYig'; 原来的key 用不了了
      //this.geocoder = L.mapbox.geocoder('mapbox.places');
	  //http://a.tiles.mapbox.com/v4/geocode/mapbox.places/27.93880000000002%2C-26.26280000000001.json?access_token=pk.eyJ1IjoiYm9iYnlzdWQiLCJhIjoiTi16MElIUSJ9.Clrqck--7WmHeqqvtFdYig
	  //http://a.tiles.mapbox.com/v4/geocode/mapbox.places/27.93880000000002%2C-26.26280000000001.json?access_token=pk.eyJ1IjoiYXR0dWluZyIsImEiOiJjamNham4ycTgwZzVkMndzM2lzYTJtN2VjIn0.kB9yWdGNuo7_oi3brXX4-A
      /*
	  this.map = L.mapbox.map(this.refs.map.getDOMNode(), this.state.mapid, {
        zoomControl: false,
      });

      this.map.setMaxBounds([ [90, -180], [-90, 180] ]);
      this.map.on('moveend', (e) => {
          this.onGeocode();
          util.setCookie('location', null, [this.map.getCenter().lat, this.map.getCenter().lng, this.map.getZoom()]);
      });*/
    });
    util.getCookie('settings', (settings) => {
      if (settings && settings.locationSettings[1].checked) {
        util.getCookie('location', (location) => {
          if (location) this.map.setView([location[0], location[1]], location[2]);
        });
      } else if (settings && settings.locationSettings[0].checked) {
        util.getCookie('location', (location) => {
          if (location) this.map.setView([location[0], location[1]], 16);
          this.map.on('locationerror', this.onLocationError);
          this.map.on('locationfound', this.onLocationFound);
          this.map.locate({
            setView: true,
            maxZoom: 16
          });
        });
      } else {
        var index = Math.floor(Math.random() * places.length - 1) + 1;
        var zoom = (this.state.mapid === 'bobbysud.79c006a5' && places[index].zoom > 14) ? 14 : places[index].zoom;
        this.map.setView([places[index].center[0], places[index].center[1]], zoom);
      }
    });
  },

  onLocationFound: function(e) {
    var self = this;
    var icon = L.divIcon({
      className: 'location-icon',
      iconSize: [20, 20]
    });
    L.marker(e.latlng, {
        icon: icon,
        clickable: false
    }).addTo(self.map);

    util.setCookie('location', null, [self.map.getCenter().lat, self.map.getCenter().lng, 16]);
  },

  onGeocode: function() {
    this.geocoder.reverseQuery(this.map.getCenter(), (err, data) => {
      if (err || !data.features) return false;
      if (data.features[0] && data.features[0].place_name.split(',').length === 4) {
          var name = data.features[0].place_name.split(',')[0] + ', ' + data.features[0].place_name.split(',')[2] + ', ' + data.features[0].place_name.split(',')[3];
      } else if (data.features[0] && data.features[0].place_name.split(',').length === 5) {
          var name = data.features[0].place_name.split(',')[1] + ', ' + data.features[0].place_name.split(',')[3] + ', ' + data.features[0].place_name.split(',')[4];
      } else if (data.features[0]) {
          var name = data.features[0].place_name;
      }
      this.props.onGeocode(name);
    });
  },

  render: function() {
    return (
      <div>
        {this.state.online &&
          <div id='map' ref='map'></div>
        }
        {!this.state.online &&
          <img src='/assets/images/offline1.jpg' height='100%' width='100%'/>
        }
      </div>
    )
  },
  mapStyles:[
	"mapbox://styles/mapbox/streets-v9",
	"mapbox://styles/mapbox/light-v9",
	"mapbox://styles/mapbox/outdoors-v9",
	"mapbox://styles/mapbox/streets-v9",
	"mapbox://styles/mapbox/navigation-guidance-night-v2",
	"mapbox://styles/mapbox/navigation-guidance-day-v2",
	"mapbox://styles/mapbox/navigation-preview-night-v2",
	"mapbox://styles/mapbox/navigation-preview-day-v2",
	"mapbox://styles/mapbox/satellite-streets-v10",
	"mapbox://styles/mapbox/satellite-v9",
	"mapbox://styles/mapbox/dark-v9"
  ],
  locations:[
	[116.39129806759,39.908405733109],[120.14236469269,30.246820640564],[83.469092142596,43.859524917599],[121.49524946213,31.241694879532],[106.74802441597,39.657511901854],[121.49544526341,25.047712516783],[120.28712083102,24.981150817871]
  ],
  chnageView:function(map){	 
	setTimeout(
		function(){
			map.animateTo({
				center: map.getCenter(),
				zoom: 13,
				pitch: 0,
				bearing: 20
			}, {
				duration: 5000
			});
		},5000);
        
        setTimeout(function () {
          map.animateTo({
            center: map.getCenter(),
            zoom: 13,
            pitch: 65,
            bearing: 360
          }, {
            duration: 7000
          });
        }, 60000);
      
  }
  

});

module.exports = Map;
