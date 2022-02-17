import * as THREE from "three";

function getRandomColor() {
  var letters = "0123456789ABCDEF";
  var color = "#";
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function randomSign() {
  return -1 + Math.round(Math.random()) * 2;
}

// https://stackoverflow.com/questions/27409074/converting-3d-position-to-2d-screen-position-r69
function toScreenPosition(position, camera, renderer) {
  var vector = position.clone();

  var widthHalf = 0.5 * renderer.getContext().canvas.width;
  var heightHalf = 0.5 * renderer.getContext().canvas.height;

  vector.project(camera);

  vector.x = Math.round(vector.x * widthHalf + widthHalf);
  vector.y = Math.round(-(vector.y * heightHalf) + heightHalf);

  return {
    x: vector.x,
    y: vector.y,
  };
}

const mapLatLong = (lat, lon, radius = 1) => {
  /* 
    mapping latitude / longitude
    https://stackoverflow.com/questions/36369734/how-to-map-latitude-and-longitude-to-a-3d-sphere 
  */
  var phi = (90 - lat) * (Math.PI / 180),
    theta = (lon + 180) * (Math.PI / 180),
    x = -(radius * Math.sin(phi) * Math.cos(theta)),
    z = radius * Math.sin(phi) * Math.sin(theta),
    y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
};

const mapXYZToLatLong = (x, y, z) => {
  let lat = 90 - (Math.acos(y) / Math.PI) * 180;
  let long = (-Math.atan2(z, x) / Math.PI) * 180;
  return new THREE.Vector2(lat, long);
};

export {
  getRandomColor,
  toScreenPosition,
  randomSign,
  mapLatLong,
  mapXYZToLatLong,
};
