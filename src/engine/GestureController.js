import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

export class GestureController {
  constructor(inputManager) {
    this.inputManager = inputManager;

    this.video = null;
    this.canvas = null;
    this.ctx = null;
    this.landmarker = null;
    this.stream = null;

    this.isEnabled = false;
    this.isModelLoaded = false;
    this.isCameraActive = false;

    this.currentGesture = 'IDLE';
    this.gestureConfidence = 0;
    this.lastVideoTime = -1;
    this.animFrameId = null;
    this.isPinching = false;

    // Listeners for UI telemetry
    this.onGestureDetected = null;
    this.onStatusChanged = null;
  }

  // Initialize MediaPipe model and canvas references
  async initialize(videoElement, canvasElement) {
    this.video = videoElement;
    this.canvas = canvasElement;
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }

    if (this.onStatusChanged) this.onStatusChanged('LOADING_MODEL');

    try {
      console.log('[Gesture] Loading MediaPipe Vision Tasks WASM...');
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );

      console.log('[Gesture] Initializing HandLandmarker with GPU delegate...');
      this.landmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
          delegate: 'GPU'
        },
        runningMode: 'VIDEO',
        numHands: 1,
        minHandDetectionConfidence: 0.5,
        minHandPresenceConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      this.isModelLoaded = true;
      console.log('[Gesture] ✅ MediaPipe HandLandmarker ready.');
      if (this.onStatusChanged) this.onStatusChanged('READY');
      return true;
    } catch (err) {
      console.error('[Gesture] Failed to load MediaPipe model:', err);
      if (this.onStatusChanged) this.onStatusChanged('ERROR', err.message);
      return false;
    }
  }

  async start(videoElement = null, canvasElement = null) {
    if (videoElement) this.video = videoElement;
    if (canvasElement) {
      this.canvas = canvasElement;
      this.ctx = this.canvas.getContext('2d');
    }

    if (!this.isModelLoaded) {
      const ok = await this.initialize(this.video, this.canvas);
      if (!ok) return false;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.warn('[Gesture] Camera access not supported in this browser.');
      if (this.onStatusChanged) this.onStatusChanged('NO_CAMERA');
      return false;
    }

    try {
      if (this.onStatusChanged) this.onStatusChanged('STARTING_CAMERA');
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 480 },
          height: { ideal: 360 },
          facingMode: 'user'
        },
        audio: false
      });

      if (this.video) {
        this.video.srcObject = this.stream;
        await new Promise((resolve) => {
          this.video.onloadeddata = () => {
            this.video.play();
            if (this.canvas) {
              this.canvas.width = this.video.videoWidth || 320;
              this.canvas.height = this.video.videoHeight || 240;
            }
            resolve();
          };
        });
      }

      this.isEnabled = true;
      this.isCameraActive = true;
      if (this.onStatusChanged) this.onStatusChanged('TRACKING');

      this.startDetectionLoop();
      return true;
    } catch (err) {
      console.error('[Gesture] Webcam permission denied or camera error:', err);
      this.isEnabled = false;
      this.isCameraActive = false;
      if (this.onStatusChanged) this.onStatusChanged('CAMERA_DENIED', err.message);
      return false;
    }
  }

  // Stop camera and tracking loop
  stop() {
    this.isEnabled = false;
    this.isCameraActive = false;

    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }

    if (this.video) {
      this.video.srcObject = null;
    }

    // Reset input states
    if (this.inputManager) {
      this.inputManager.setGestureState({
        forward: false,
        backward: false,
        left: false,
        right: false,
        sprint: false,
        turnDeltaX: 0
      });
    }

    this.clearCanvas();
    this.isPinching = false;
    this.currentGesture = 'OFFLINE';
    if (this.onStatusChanged) this.onStatusChanged('STOPPED');
  }

  toggle() {
    if (this.isEnabled) {
      this.stop();
      return false;
    } else {
      return this.start();
    }
  }

  startDetectionLoop() {
    const processFrame = () => {
      if (!this.isEnabled || !this.video || !this.landmarker) return;

      const now = performance.now();

      if (this.video.currentTime !== this.lastVideoTime && this.video.videoWidth > 0) {
        this.lastVideoTime = this.video.currentTime;

        try {
          const results = this.landmarker.detectForVideo(this.video, now);
          this.handleDetectionResults(results);
        } catch (e) {
          // Ignore frame drop
        }
      }

      this.animFrameId = requestAnimationFrame(processFrame);
    };

    this.animFrameId = requestAnimationFrame(processFrame);
  }

  handleDetectionResults(results) {
    if (!this.canvas || !this.ctx) return;
    this.clearCanvas();

    if (!results || !results.landmarks || results.landmarks.length === 0) {
      // No hand detected
      this.currentGesture = 'NO_HAND';
      this.inputManager?.setGestureState({
        forward: false,
        backward: false,
        left: false,
        right: false,
        sprint: false,
        turnDeltaX: 0
      });
      if (this.onGestureDetected) {
        this.onGestureDetected('NO_HAND', null);
      }
      return;
    }

    const landmarks = results.landmarks[0];
    this.drawSkeleton(landmarks);
    this.classifyAndApplyGesture(landmarks);
  }

  classifyAndApplyGesture(lm) {
    // ── 1. Calculate Finger Open / Curled States ──────────────────────
    const wrist = lm[0];
    const thumbTip = lm[4];
    const indexTip = lm[8];
    const indexPip = lm[6];
    const middleTip = lm[12];
    const middlePip = lm[10];
    const ringTip = lm[16];
    const ringPip = lm[14];
    const pinkyTip = lm[20];
    const pinkyPip = lm[18];

    // Distance helpers
    const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

    // Tip-to-wrist extension ratio
    const isIndexExtended = dist(indexTip, wrist) > dist(indexPip, wrist) * 1.25;
    const isMiddleExtended = dist(middleTip, wrist) > dist(middlePip, wrist) * 1.25;
    const isRingExtended = dist(ringTip, wrist) > dist(ringPip, wrist) * 1.25;
    const isPinkyExtended = dist(pinkyTip, wrist) > dist(pinkyPip, wrist) * 1.25;

    const extendedCount = [
      isIndexExtended,
      isMiddleExtended,
      isRingExtended,
      isPinkyExtended
    ].filter(Boolean).length;

    // Pinch distance between thumb tip and index tip
    const pinchDist = dist(thumbTip, indexTip);

    // ── 2. Gesture Classification (Forward, Pinch Interact, and Idle) ───
    let detectedGesture = 'IDLE';
    let forward = false;

    // Pinch Gesture (Thumb Tip close to Index Tip) -> Trigger Interact / Loot
    if (pinchDist < 0.08) {
      detectedGesture = 'PINCH';
      forward = false;
      if (!this.isPinching) {
        this.isPinching = true;
        this.inputManager?.triggerInteract();
      }
    } else {
      if (pinchDist > 0.11) {
        this.isPinching = false;
      }
      // Open hand (fingers extended) -> Move Forward
      if (extendedCount >= 3) {
        detectedGesture = 'FORWARD';
        forward = true;
      } else {
        detectedGesture = 'IDLE';
        forward = false;
      }
    }

    this.currentGesture = detectedGesture;

    // Apply to game engine InputManager
    if (this.inputManager) {
      this.inputManager.setGestureState({
        forward,
        backward: false,
        left: false,
        right: false,
        sprint: false,
        turnDeltaX: 0
      });
    }

    if (this.onGestureDetected) {
      this.onGestureDetected(detectedGesture, {
        forward,
        pinch: this.isPinching
      });
    }
  }

  // ── 3. Neon Skeleton Overlay Drawing ────────────────────────────────
  drawSkeleton(landmarks) {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // MediaPipe Hand Bone Connections
    const connections = [
      [0, 1], [1, 2], [2, 3], [3, 4],       // Thumb
      [0, 5], [5, 6], [6, 7], [7, 8],       // Index
      [0, 9], [9, 10], [10, 11], [11, 12],  // Middle
      [0, 13], [13, 14], [14, 15], [15, 16],// Ring
      [0, 17], [17, 18], [18, 19], [19, 20],// Pinky
      [5, 9], [9, 13], [13, 17]             // Palm base
    ];

    // Colors matching cyberpunk aesthetic
    let lineColor = '#00f0ff';
    let jointColor = '#38bdf8';

    if (this.currentGesture === 'PINCH') {
      lineColor = '#f59e0b'; // Radiant amber when pinching to interact
      jointColor = '#fbbf24';
    } else if (this.currentGesture === 'FORWARD') {
      lineColor = '#00ff88'; // Vibrant green when walking forward
      jointColor = '#66ffaa';
    } else {
      lineColor = '#64748b'; // Neutral slate when idle
      jointColor = '#94a3b8';
    }

    // Draw Bone Lines
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = lineColor;
    ctx.shadowColor = lineColor;
    ctx.shadowBlur = 8;

    for (const [start, end] of connections) {
      const p1 = landmarks[start];
      const p2 = landmarks[end];
      // Mirror X so movement aligns with user's mirror view
      const x1 = (1 - p1.x) * w;
      const y1 = p1.y * h;
      const x2 = (1 - p2.x) * w;
      const y2 = p2.y * h;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    ctx.shadowBlur = 0;

    // Draw Joint Nodes
    for (let i = 0; i < landmarks.length; i++) {
      const p = landmarks[i];
      const x = (1 - p.x) * w;
      const y = p.y * h;

      ctx.beginPath();
      const radius = i === 4 || i === 8 || i === 12 || i === 16 || i === 20 ? 4 : 2.5;
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = jointColor;
      ctx.fill();
    }
  }

  clearCanvas() {
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
}
