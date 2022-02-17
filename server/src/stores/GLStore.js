import {
  onSnapshot,
  getSnapshot,
  types,
  flow,
  applySnapshot,
  destroy,
  getParent,
  getRoot,
} from "mobx-state-tree";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import ViewerStore from "./ViewerStore";
import { nanoid } from "nanoid";
import { mapXYZToLatLong } from "../utils";

const GLStore = types
  .model("GLStore", {
    globalScale: 0.3,
    dragSpeed: 2,
    viewer: ViewerStore,
  })
  .volatile(() => ({
    renderer: null,
    scene: null,
    camera: null,
    raycaster: null,
    ready: false,
    controls: null,
    anchorPosition: null,
    touchElapsed: 0,
    mouse: null,
    dt: 1000 / 30,
    timeTarget: 0,
    mouse: new THREE.Vector2(),
    canvasBounds: null,
    isHoveringOverSphere: false,
  }))
  .actions((self) => ({
    afterCreate: () => {
      self.raycaster = new THREE.Raycaster();
      self.scene = new THREE.Scene();
    },

    init: (canvas, bounds) => {
      self.renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        canvas: canvas,
      });

      self.renderer.setSize(bounds.width, bounds.height);
      self.renderer.domElement.id = "MAINCANVAS";

      self.camera = new THREE.PerspectiveCamera(
        10,
        bounds.width / bounds.height,
        0.1,
        1000
      );

      self.controls = new OrbitControls(self.camera, self.renderer.domElement);
      self.camera.position.set(20, 0.5, 2);
      self.controls.update();
      self.renderer.setAnimationLoop(self.render);

      /* initialize viewer */
      self.viewer.init();

      self.renderer.domElement.addEventListener("mousemove", self.onMouseMove);
      self.renderer.domElement.addEventListener("dblclick", self.onDblClick);
    },

    render: (timestamp, frame) => {
      if (Date.now() >= self.timeTarget) {
        self.renderer.render(self.scene, self.camera);

        self.viewer.update(self.camera, self.renderer, self.bounds);

        self.timeTarget += self.dt;
        if (Date.now() >= self.timeTarget) {
          self.timeTarget = Date.now();
        }
      }
    },

    handleResize: (w, h) => {
      self.camera.aspect = w / h;
      self.camera.updateProjectionMatrix();

      self.renderer.setSize(w, h);

      self.renderer.domElement.width = w;
      self.renderer.domElement.height = h;
      self.renderer.domElement.style.width = w + "px";
      self.renderer.domElement.style.height = h + "px";

      self.renderer.render(self.scene, self.camera);

      self.canvasBounds = self.renderer.domElement.getBoundingClientRect();
    },

    focusOnTarget: (target) => {
      self.controls.target = target.clone().add(new THREE.Vector3(0, 0, 0));
      self.controls.update();
    },

    onMouseMove(e) {
      if(!self.canvasBounds) return

      self.mouse.x =
        ((e.clientX - self.canvasBounds.x) / self.canvasBounds.width) * 2 - 1;
      self.mouse.y =
        -((e.clientY + self.canvasBounds.y) / self.canvasBounds.height) * 2 + 1;
      self.camera.updateMatrixWorld();

      // find intersections
      self.raycaster.setFromCamera(self.mouse, self.camera);

      var intersects = self.raycaster.intersectObject(self.viewer.mesh);

      if (intersects.length > 0) {
        self.isHoveringOverSphere = true;
        var firstIntersectedObject = intersects[0];
        // update cursor position
        self.viewer.cursor.position.copy(firstIntersectedObject.point);
        document.documentElement.style.cursor = "crosshair";
      } else {
        self.isHoveringOverSphere = false;
        self.viewer.cursor.position.set(0, 0, 0);
        document.documentElement.style.cursor = "auto";
      }
    },

    onDblClick(e) {
      if (self.isHoveringOverSphere) {
        let latLong;

        /* project from sphere */
        if (self.viewer.viewType === "Globe") {
          // on double click, create new node at position
          latLong = mapXYZToLatLong(
            self.viewer.cursor.position.x,
            self.viewer.cursor.position.y,
            self.viewer.cursor.position.z
          );
        }

        /* project from plane */
        if (self.viewer.viewType === "Flat") {
          console.log("projecting to plane", self.viewer.cursor.position);
          latLong = new THREE.Vector2(
            self.viewer.cursor.position.x * 360,
            self.viewer.cursor.position.y * 360
          );
        }

        getRoot(self).addNewNode(nanoid(5), latLong);
      }
    },
  }));

export default GLStore;
