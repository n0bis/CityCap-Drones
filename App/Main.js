//javascript.js
//set map options
var myLatLng = { lat: 55.3954147, lng: 10.3913793 };
var mapOptions = {
    center: myLatLng,
    zoom: 9,
    mapTypeId: google.maps.MapTypeId.HYBRID

};

//create map
var map = new google.maps.Map(document.getElementById('googleMap'), mapOptions);

//create a DirectionsService object to use the route method and get a result for our request
var directionsService = new google.maps.DirectionsService();

//create a DirectionsRenderer object which we will use to display the route
var directionsDisplay = new google.maps.DirectionsRenderer();

//bind the DirectionsRenderer to the map
directionsDisplay.setMap(map);

var marker = new google.maps.Marker( {icon: {
    url: './Content/drone.svg',
    // This marker is 20 pixels wide by 32 pixels high.
    size: new google.maps.Size(48, 48),
    // The origin for this image is (0, 0).
    origin: new google.maps.Point(0, 0),
    // The anchor for this image is the base of the flagpole at (0, 32).
    anchor: new google.maps.Point(24, 24)
}, position: myLatLng, map: map} );
marker.setMap( map );

const sleep = ms => new Promise(res => setTimeout(res, ms))

//define calcRoute function
function calcRoute() {
    //create request
    var request = {
        origin: document.getElementById("from").value,
        destination: document.getElementById("to").value,
        travelMode: google.maps.TravelMode.DRIVING, //WALKING, BYCYCLING, TRANSIT
        unitSystem: google.maps.UnitSystem.METRIC
    }
    //pass the request to the route method
    directionsService.route(request, function (result, status) {
        if (status == google.maps.DirectionsStatus.OK) {

            //Get distance and time
            const output = document.querySelector('#output');
            output.innerHTML = "<div class='alert-info'>From: " + document.getElementById("from").value + ".<br />To: " + document.getElementById("to").value + ".<br /> Distance <i class='fas fa-road'></i> : " + result.routes[0].legs[0].distance.text + ".<br />Duration <i class='fas fa-hourglass-start'></i> : " + result.routes[0].legs[0].duration.text + ".</div>";
            //displayInfo(document.getElementById("from").value, document.getElementById("to").value, result.routes[0].legs[0].distance.text)
            //display route
            directionsDisplay.setDirections(result);
            let start = result.routes[0].legs[0].start_location
            let end = result.routes[0].legs[0].end_location
            //moveTo(result.routes[0].overview_path);
            moveDrone(start, end);
            /*result.routes[0].overview_path.map(async element => {
                marker.setPosition( new google.maps.LatLng( element.lat(), element.lng() ) );
                await sleep(3000);
            })*/
            //moveBus( map, marker );
        } else {
            //delete route from map
            directionsDisplay.setDirections({ routes: [] });
            //center map in London
            map.setCenter(myLatLng);

            //show error message
            output.innerHTML = "<div class='alert-danger'><i class='fas fa-exclamation-triangle'></i> Could not retrieve distance.</div>";
        }
    });
}

async function moveTo(elements) {
    for (var i = 0; i < elements.length; i++) {
        marker.setPosition( new google.maps.LatLng( elements[i].lat(), elements[i].lng() ) );
        await sleep(2000);
    }
}

async function moveDrone(start, end) {
    let drone_velocity = 70;
    let startLocation = new Point(start.lat(), start.lng())
    let endLocation = new Point(end.lat(), end.lng())
    let distanceBetweenPoints = CalculateDistanceBetweenLocations(startLocation, endLocation) * 1000;
    let timeRequired = distanceBetweenPoints / drone_velocity;
    for (var i = 0; i < timeRequired; i++) {
        let bearing = CalculateBearing(startLocation, endLocation);
        let distanceInKm = drone_velocity / 1000;
        let intermediaryLocation = CalculateDestinationLocation(startLocation, bearing, distanceInKm);
        marker.setPosition( new google.maps.LatLng( intermediaryLocation.latitude, intermediaryLocation.longitude ) );
        startLocation = intermediaryLocation;
        let distance = CalculateDistanceBetweenLocations(startLocation, endLocation) * 1000;
        distanceInKm = Math.round(distance / 1000 * 100) / 100
        let remaining = distanceInKm / drone_velocity;
        displayInfo(distanceInKm, Math.round(remaining * 60));
        await sleep(2000);
    }
}

function displayInfo(distance, duration) {
    const output = document.querySelector('#output');
    const to = document.getElementById("to").value;
    output.innerHTML = "<div class='alert-info'>To: " + to + ".<br /> Distance <i class='fas fa-road'></i> : " + distance + " km.<br />Duration <i class='fas fa-hourglass-start'></i> : " + duration + " min.</div>";
}


//create autocomplete objects for all inputs
var options = {
    types: ['(cities)']
}

var input1 = document.getElementById("from");
var autocomplete1 = new google.maps.places.Autocomplete(input1, options);

var input2 = document.getElementById("to");
var autocomplete2 = new google.maps.places.Autocomplete(input2, options);
