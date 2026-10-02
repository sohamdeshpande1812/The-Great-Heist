// Input Manager with Keyboard, Pointer Lock Mouse Look, and Webcam Gesture Control

export class InputManager {
  constructor(canvas) {
    this.canvas = canvas;

    this.keyboardKeys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      sprint: false,
      interact: false,
      inventory: false
    };

    this.gestureKeys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      sprint: false,
      interact: false
    };

    this.mouseDelta = { x: 0, y: 0 };
    this.gestureTurnDeltaX = 0;
    this.sensitivity = 0.0022; // default
    this.isPointerLocked = false;
    this.callbacks = {};

    this.setupListeners();
  }

  get keys() {
    return {
      forward: this.gestureKeys.forward,
      backward: this.gestureKeys.backward,
      left: this.gestureKeys.left,
      right: this.gestureKeys.right,
      sprint: this.gestureKeys.sprint,
      interact: this.gestureKeys.interact,
      inventory: this.keyboardKeys.inventory
    };
  }

  setupListeners() {
    window.addEventListener('keydown', (e) => this.onKeyDown(e));
    window.addEventListener('keyup', (e) => this.onKeyUp(e));

    document.addEventListener('pointerlockchange', () => {
      this.isPointerLocked = document.pointerLockElement === this.canvas;
      if (this.callbacks.onPointerLockChange) {
        this.callbacks.onPointerLockChange(this.isPointerLocked);
      }
    });

    document.addEventListener('mousemove', (e) => {
      if (this.isPointerLocked) {
        this.mouseDelta.x += e.movementX || 0;
        this.mouseDelta.y += e.movementY || 0;
      }
    });
  }

  setGestureState({
    forward = false,
    backward = false,
    left = false,
    right = false,
    sprint = false,
    turnDeltaX = 0
  }) {
    this.gestureKeys.forward = forward;
    this.gestureKeys.backward = backward;
    this.gestureKeys.left = left;
    this.gestureKeys.right = right;
    this.gestureKeys.sprint = sprint;
    this.gestureTurnDeltaX += turnDeltaX;
  }

  triggerInteract() {
    if (this.callbacks.onInteract) {
      this.callbacks.onInteract();
    }
  }

  requestPointerLock() {
    if (!this.isPointerLocked && this.canvas) {
      this.canvas.requestPointerLock().catch(() => {});
    }
  }

  exitPointerLock() {
    if (this.isPointerLocked) {
      document.exitPointerLock();
    }
  }

  setSensitivity(val) {
    // val 1 - 10
    this.sensitivity = (val / 5) * 0.0022;
  }

  onKeyDown(e) {
    // Ignore key inputs when user is typing in text input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
      case 'KeyS':
      case 'ArrowDown':
      case 'KeyA':
      case 'ArrowLeft':
      case 'KeyD':
      case 'ArrowRight':
      case 'ShiftLeft':
      case 'ShiftRight':
      case 'KeyE':
        // Operative is controlled strictly with 3 Hand Gestures + Mouse
        if (this.callbacks.onKeyboardMovementAttempt) {
          this.callbacks.onKeyboardMovementAttempt();
        }
        break;
      case 'Space':
        e.preventDefault();
        break;
      case 'KeyQ':
        if (this.callbacks.onQuickDrop) this.callbacks.onQuickDrop();
        break;
      case 'KeyG':
        if (this.callbacks.onToggleGesture) this.callbacks.onToggleGesture();
        break;
      case 'KeyI':
        if (this.callbacks.onToggleInventory) this.callbacks.onToggleInventory();
        break;
      case 'KeyH':
        if (this.callbacks.onToggleHowToPlay) this.callbacks.onToggleHowToPlay();
        break;
      case 'Escape':
        if (this.callbacks.onEscape) this.callbacks.onEscape();
        break;
    }
  }

  onKeyUp(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.keyboardKeys.forward = false;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.keyboardKeys.backward = false;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.keyboardKeys.left = false;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.keyboardKeys.right = false;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.keyboardKeys.sprint = false;
        break;
      case 'Space':
        break;
      case 'KeyE':
        this.keyboardKeys.interact = false;
        break;
    }
  }

  consumeMouseDelta() {
    const delta = {
      x: this.mouseDelta.x * this.sensitivity + (this.gestureTurnDeltaX || 0),
      y: this.mouseDelta.y * this.sensitivity
    };
    this.mouseDelta.x = 0;
    this.mouseDelta.y = 0;
    this.gestureTurnDeltaX = 0;
    return delta;
  }
}
