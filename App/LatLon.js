var _earthRadius = 6371

class Point {
  constructor(latitude, longitude) {
    this.latitude = latitude;
    this.longitude = longitude;
  }
}

function DegreeToRadian(degree) {
  return (degree * Math.PI / 180) 
}

function RadianToDegree(radian) {
  return (radian * 180 / Math.PI)
}

function CalculateBearing(start, end) {
  let lat1 = DegreeToRadian(start.latitude)
  let lat2 = DegreeToRadian(end.latitude)
  let deltaLon = DegreeToRadian(end.longitude - start.longitude)
  let y = Math.sin(deltaLon) * Math.cos(lat2)
  let x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLon)
  let bearing = Math.atan2(y, x)
  return (RadianToDegree(bearing) + 360) % 360
}

function CalculateDestinationLocation(point, bearing, distance) {
  distance /= _earthRadius
  bearing = DegreeToRadian(bearing)
  let lat1 = DegreeToRadian(point.latitude)
  let lon1 = DegreeToRadian(point.longitude)
  let lat2 = Math.asin(Math.sin(lat1) * Math.cos(distance) + Math.cos(lat1) * Math.sin(distance) * Math.cos(bearing));
  let lon2 = lon1 + Math.atan2(Math.sin(bearing) * Math.sin(distance) * Math.cos(lat1), Math.cos(distance) - Math.sin(lat1) * Math.sin(lat2));
  lon2 = (lon2 + 3 * Math.PI) % (2 * Math.PI) - Math.PI; // normalize to -180 - + 180 degrees
  return new Point(RadianToDegree(lat2), RadianToDegree(lon2))
}

function CalculateDistanceBetweenLocations(start, end) {
  let lat1 = DegreeToRadian(start.latitude);
  let lon1 = DegreeToRadian(start.longitude);

  let lat2 = DegreeToRadian(end.latitude);
  let lon2 = DegreeToRadian(end.longitude);

  let deltaLat = lat2 - lat1;
  let deltaLon = lon2 - lon1;

  let a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
  let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return (_earthRadius * c);
}