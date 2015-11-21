var map;
var service;
var infowindow;

function initialize() {
  var pyrmont = new google.maps.LatLng(55.863791, -4.251667);

  map = new google.maps.Map(document.getElementById('map'), {
      center: pyrmont,
      zoom: 15
    });

  var request = {
    location: pyrmont,
    radius: '500',
    query: 'restaurant'
  };

  service = new google.maps.places.PlacesService(map);
  service.textSearch(request, callback);
}

function callback(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
      var place = PlaceResult[i];
	$('#placename').text(PlaceResult[i]);
  }
}


function addPlace(place){
	//$('#placename').text(place);
	openNow = null;
	if (place.opening_hours)
	    openNow = place.opening_hours.open_now ? 'Open now' : 'Closed';
	var result = '<div class="result">';
	if (place.photos)
	    result += '<img class="restaurant-image" src="' + place.photos[0].getUrl({'maxWidth': 100, 'maxHeight': 100}) + '"/>';
	else
	    result += '<img class="restaurant-image" src="images/restaurant.jpg"/>';
	result += '<span class="title">' + place.name + '</span><div class="rating">'+ getRating(place.rating) +'</div>';
	result += '<div class="details">';
	result += 'Chinese - Chinese dining with dumpling specials<br/>' + place.formatted_address + '<br/>';
	if (openNow)
	  result += openNow;
	else
	  result += 'No info about opening hours';
	result += '</div></div>';

	$('#place').append(result);

}
  $(window).load(function(){
        var place = location.search.split("&")[0].replace("?","").split("=")[1];

	addPlace(place);
	
  });
