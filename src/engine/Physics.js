import * as THREE from 'three';

export class Physics {
  constructor() {
    this.colliders = [];
    this.doors = [];
    this.gravity = -24;
  }

  addCollider(box3) {
    this.colliders.push(box3);
  }

  addDoor(door) {
    this.doors.push(door);
  }

  addBoxColliderFromMesh(mesh) {
    mesh.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(mesh);
    this.colliders.push(box);
    return box;
  }

  clear() {
    this.colliders = [];
    this.doors = [];
  }

  // Determine current expected floor level Y for character based on current elevation
  getGroundHeightAt(x, z, currentY) {
    // Discrete floor layers with hysteresis to prevent snapping jitter
    if (currentY >= 12) {
      return 16; // Rooftop
    }
    if (currentY >= 4) {
      return 8;  // Second Floor
    }
    if (currentY >= -4) {
      return 0;  // Ground Floor
    }
    return -8;   // Underground
  }

  // Resolve player bounding box against world wall colliders, solid props, and closed doors
  // Supports axis-separated resolution ('x', 'z', or null for both) to enable smooth sliding
  resolveCollisions(position, radius = 0.45, height = 1.8, axis = null) {
    const playerBox = new THREE.Box3(
      new THREE.Vector3(position.x - radius, position.y, position.z - radius),
      new THREE.Vector3(position.x + radius, position.y + height, position.z + radius)
    );

    // Run up to 3 iterations to ensure complete resolution in corners and between adjacent obstacles
    const iterations = axis ? 2 : 3;
    for (let iter = 0; iter < iterations; iter++) {
      let collided = false;

      // 1. Resolve Static Wall & Prop Colliders
      for (let i = 0; i < this.colliders.length; i++) {
        if (this.resolveSingleBox(playerBox, this.colliders[i], position, radius, height, axis)) {
          collided = true;
        }
      }

      // 2. Resolve Closed Door Colliders
      for (let i = 0; i < this.doors.length; i++) {
        const door = this.doors[i];
        if (!door.isOpen && door.colliderBox) {
          if (this.resolveSingleBox(playerBox, door.colliderBox, position, radius, height, axis)) {
            collided = true;
          }
        }
      }

      if (!collided) break;
    }
  }

  resolveSingleBox(playerBox, collider, position, radius, height, axis = null) {
    if (collider.max.y < position.y || collider.min.y > position.y + height) {
      return false;
    }

    if (!playerBox.intersectsBox(collider)) {
      return false;
    }

    const overlapX1 = collider.max.x - playerBox.min.x;
    const overlapX2 = playerBox.max.x - collider.min.x;
    const overlapX = Math.min(overlapX1, overlapX2);

    const overlapZ1 = collider.max.z - playerBox.min.z;
    const overlapZ2 = playerBox.max.z - collider.min.z;
    const overlapZ = Math.min(overlapZ1, overlapZ2);

    let resolveOnX = false;
    if (axis === 'x') {
      resolveOnX = true;
    } else if (axis === 'z') {
      resolveOnX = false;
    } else {
      resolveOnX = overlapX < overlapZ;
    }

    if (resolveOnX) {
      const centerX = (collider.min.x + collider.max.x) * 0.5;
      if (position.x < centerX) {
        position.x = collider.min.x - radius - 0.001;
      } else {
        position.x = collider.max.x + radius + 0.001;
      }
      playerBox.min.x = position.x - radius;
      playerBox.max.x = position.x + radius;
    } else {
      const centerZ = (collider.min.z + collider.max.z) * 0.5;
      if (position.z < centerZ) {
        position.z = collider.min.z - radius - 0.001;
      } else {
        position.z = collider.max.z + radius + 0.001;
      }
      playerBox.min.z = position.z - radius;
      playerBox.max.z = position.z + radius;
    }

    return true;
  }

  // Raycast against all static wall/prop colliders and closed doors
  // Returns closest hit distance if obstructed, otherwise null
  raycastColliders(origin, direction, maxDistance) {
    const ray = new THREE.Ray(origin, direction);
    const hitPoint = new THREE.Vector3();
    let closestDist = maxDistance;
    let hitFound = false;

    // 1. Static Wall & Prop Colliders
    for (let i = 0; i < this.colliders.length; i++) {
      const collider = this.colliders[i];
      if (ray.intersectBox(collider, hitPoint)) {
        const dist = origin.distanceTo(hitPoint);
        if (dist < closestDist) {
          closestDist = dist;
          hitFound = true;
        }
      }
    }

    // 2. Closed Doors
    for (let i = 0; i < this.doors.length; i++) {
      const door = this.doors[i];
      if (!door.isOpen && door.colliderBox) {
        if (ray.intersectBox(door.colliderBox, hitPoint)) {
          const dist = origin.distanceTo(hitPoint);
          if (dist < closestDist) {
            closestDist = dist;
            hitFound = true;
          }
        }
      }
    }

    return hitFound ? closestDist : null;
  }
}

export const physics = new Physics();
