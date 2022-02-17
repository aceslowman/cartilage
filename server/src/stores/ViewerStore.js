import { getRoot, types } from "mobx-state-tree";
import * as THREE from "three";
import { toScreenPosition, mapLatLong } from "../utils";

/* 
  ViewerStore is mainly responsible for handling the 3D geometry for
  the markers and for the server visualization
*/

const ViewerStore = types
  .model("ViewerStore", {
    viewType: types.enumeration("View", ["Globe", "Flat"]),
  })
  .volatile(() => ({
    solidSphereGeometry: null,
    smallerSphereGeometry: null,
    solidSphereMaterial: null,
    wireSphereGeometry: null,
    wireSphereMaterial: null,
    wireframe: null,
    mesh: null,
    cursor: null,
    cursorGeometry: null,
    cursorMaterial: null,
  }))
  .actions((self) => ({
    afterCreate: () => {},

    init: () => {
      /* 3D cursor */
      self.cursorGeometry = new THREE.SphereGeometry(0.05, 8, 8);
      self.cursorMaterial = new THREE.MeshBasicMaterial({
        color: "white",
      });
      self.cursor = new THREE.Mesh(self.cursorGeometry, self.cursorMaterial);

      /* hide or show cursor */
      // getRoot(self).gl.scene.add(self.cursor);

      self.setViewType("Globe");
    },

    update: () => {
      /* TODO only update when orbit controls are moved */
      getRoot(self).gl.camera.updateProjectionMatrix();

      // add label to each node
      for (let node of Array.from(getRoot(self).nodes.values())) {
        if (self.viewType === "Globe") {
          const worldPosition = mapLatLong(
            node.position.x,
            node.position.y
          );

          let coords = toScreenPosition(
            worldPosition,
            getRoot(self).gl.camera,
            getRoot(self).gl.renderer
          );

          // update position based on screen coords
          node.setScreenPosition(coords);

          /*
            check to see if node is in front of or behind sphere for occlusion 
          */
          let distanceBetweenCameraAndMarker = worldPosition.distanceTo(
            getRoot(self).gl.camera.position
          );
          let distanceBetweenCameraAndSphere = self.mesh.position.distanceTo(
            getRoot(self).gl.camera.position
          );

          if (distanceBetweenCameraAndMarker > distanceBetweenCameraAndSphere) {
            node.hide();
          } else {
            node.show();
          }
        } else if (self.viewType === "Flat") {
          let coords = toScreenPosition(
            new THREE.Vector3(
              node.position.x,
              node.position.y,
              0
            ).multiplyScalar(1 / 360),
            getRoot(self).gl.camera,
            getRoot(self).gl.renderer
          );

          // update position based on screen coords
          node.setScreenPosition(coords);

          node.show();
        }
      }
    },

    setViewType: (v) => {
      self.viewType = v;

      getRoot(self).gl.scene.remove(self.mesh);
      getRoot(self).gl.scene.remove(self.wireframe);

      switch (v) {
        case "Flat":
          self.generateFlatView();
          break;
        case "Globe":
          self.generateGlobeView();
          break;
        default:
          break;
      }

      getRoot(self).gl.scene.add(self.mesh);
      getRoot(self).gl.scene.add(self.wireframe);
    },

    generateGlobeView: () => {
      getRoot(self).gl.controls.reset();
      getRoot(self).gl.camera.position.set(20, 0.5, 0);
      getRoot(self).gl.camera.up.set(0,1,0);
      getRoot(self).gl.controls.update();
      getRoot(self).gl.controls.enableRotate = true;
      getRoot(self).gl.controls.enablePan = false;

      /* solid sphere */
      self.solidSphereGeometry = new THREE.SphereGeometry(1, 32, 32);
      self.smallerSphereGeometry = new THREE.SphereGeometry(0.99, 32, 32);
      self.solidSphereMaterial = new THREE.MeshBasicMaterial({
        color: "#efe9e5",
      });

      self.mesh = new THREE.Mesh(
        self.smallerSphereGeometry,
        self.solidSphereMaterial
      );

      self.mesh.name = "sphere";

      /* wireframe sphere */
      self.wireSphereGeometry = new THREE.EdgesGeometry(
        self.solidSphereGeometry
      );
      self.wireSphereMaterial = new THREE.LineBasicMaterial({
        color: "#670909",
      });
      self.wireframe = new THREE.LineSegments(
        self.wireSphereGeometry,
        self.wireSphereMaterial
      );
    },

    generateFlatView: () => {
      // getRoot(self).gl.scene.remove(self.gridHelper);
      getRoot(self).gl.camera.position.set(0, 0.5, 10);
      getRoot(self).gl.camera.up.set(-1,0,0);
      // getRoot(self).gl.camera.rotateZ(Math.PI/);
      getRoot(self).gl.controls.update();
      getRoot(self).gl.controls.enableRotate = false;
      getRoot(self).gl.controls.enablePan = true;

      /* solid plane */
      self.solidPlaneGeometry = new THREE.PlaneGeometry(1, 1, 32, 32);
      self.solidPlaneMaterial = new THREE.MeshBasicMaterial({
        color: "#efe9e5",
      });

      self.mesh = new THREE.Mesh(
        self.solidPlaneGeometry,
        self.solidPlaneMaterial
      );

      self.mesh.name = "flat plane";

      self.wireframe = new THREE.GridHelper(1,18,"#670909","#bab4b4");
      self.wireframe.position.set(0.0,0,0.01);
      self.wireframe.rotateX(Math.PI/2);
    },
  }));

export default ViewerStore;
