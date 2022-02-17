import * as THREE from "three";
import {
  onSnapshot,
  getSnapshot,
  getParent,
  types,
  flow,
  applySnapshot,
  destroy
} from "mobx-state-tree";


const Vector2Type = types.custom({
  name: "Vector2",
  fromSnapshot(value) {
    return new THREE.Vector2(value.x, value.y);
  },
  toSnapshot(value) {
    return {x: value.x, y: value.y};
  },
  isTargetType(value) {
    return value instanceof THREE.Vector2;
  },
  getValidationMessage(value) {
    if (value.x) return ""; // OK
    return `'${value}' doesn't look like a valid vector3`;
  }
});

const Vector3Type = types.custom({
  name: "Vector3",
  fromSnapshot(value) {
    return new THREE.Vector3(value.x, value.y, value.z);
  },
  toSnapshot(value) {
    return {x: value.x, y: value.y, z: value.z};
  },
  isTargetType(value) {
    return value instanceof THREE.Vector3;
  },
  getValidationMessage(value) {
    if (value.x) return ""; // OK
    return `'${value}' doesn't look like a valid vector3`;
  }
});

export {Vector2Type, Vector3Type}