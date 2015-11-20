var map;
var service;

function initMap() {
  var glasgow = new google.maps.LatLng(55.8555367,-4.3024978);
    
  map = new google.maps.Map(document.getElementById('map'), {
    
    center: glasgow,
    zoom: 14
  });
    
  var request = {
    location: glasgow,
    radius: '500',
    query: 'restaurant'
  };

  service = new google.maps.places.PlacesService(map);
  service.textSearch(request, callback);
}

function callback(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < results.length; i++) {
      var place = results[i];
      addMarker(results[i]);
    }
  }
}

function addMarker(place) {
  var marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location,
    icon: {
      url: 'http://maps.gstatic.com/mapfiles/circle.png',
      anchor: new google.maps.Point(10, 10),
      scaledSize: new google.maps.Size(10, 17)
    }
  });
}


 
