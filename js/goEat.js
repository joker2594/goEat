
var myCenter=new google.maps.LatLng(55.8651500,-4.2576300);

function initialize()
{
var mapProp = {
  center:myCenter,
  zoom:10,
  mapTypeControl: false,
  mapTypeId:google.maps.MapTypeId.ROADMAP
  };

var map=new google.maps.Map(document.getElementById("googleMap"),mapProp);

var marker=new google.maps.Marker({
  position:myCenter,
  });

marker.setMap(map);
}

google.maps.event.addDomListener(window, 'load', initialize);
 
 function showMenu(){
   document.getElementById("menuOptions").style.display="block";
 }
 function hideMenu(){
   document.getElementById("menuOptions").style.display="none";
 }
