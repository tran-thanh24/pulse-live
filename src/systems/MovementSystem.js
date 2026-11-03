import { collisionSystem } from './CollisionSystem';

/**
 * MovementSystem: Handles WASD + Arrow keys + Shift (Run) + Space (Jump) + Mobile Touch Joystick.
 * Integrates with CollisionSystem & AccessControlSystem to enforce solid collisions against
 * MAIN_STAGE, RUNWAY, B_STAGE, STAGE_BARRIER, BACKSTAGE, VIP_ZONE, and Booths,
 * plus airborne jump restriction near stage barriers.
 */
export class MovementSystem {
  constructor() {
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      run: false,
      jump: false
    };
    this.velocityY = 0;
    this.isGrounded = true;
    this.walkSpeed = 6.8;
    this.runSpeed = 11.8;
    this.jumpImpulse = 6.0;
    this.gravity = 16.5;
    this.playerRadius = 0.55;
  }

  handleKeyDown(code) {
    switch (code) {
      case 'KeyW':
      case 'ArrowUp':
        this.keys.forward = true;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.keys.backward = true;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.keys.left = true;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.keys.right = true;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.keys.run = true;
        break;
      case 'Space':
        this.keys.jump = true;
        break;
      default:
        break;
    }
  }

  handleKeyUp(code) {
    switch (code) {
      case 'KeyW':
      case 'ArrowUp':
        this.keys.forward = false;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.keys.backward = false;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.keys.left = false;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.keys.right = false;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.keys.run = false;
        break;
      case 'Space':
        this.keys.jump = false;
        break;
      default:
        break;
    }
  }

  resetKeys() {
    this.keys.forward = false;
    this.keys.backward = false;
    this.keys.left = false;
    this.keys.right = false;
    this.keys.run = false;
    this.keys.jump = false;
  }

  update(
    delta,
    currentPos,
    currentRot,
    cameraYaw,
    joystickVector,
    isBlockedByModal,
    characterConfig = { role: 'PLAYER' },
    ticket = null,
    onRestrictedHit = null
  ) {
    const dt = Math.min(delta, 0.1);
    let [x, y, z] = currentPos;
    const prevX = x;
    const prevZ = z;
    let rot = currentRot;

    if (isBlockedByModal) {
      return {
        position: [x, 0, z],
        rotation: rot,
        isMoving: false,
        isRunning: false,
        isJumping: false
      };
    }

    let moveX = 0;
    let moveZ = 0;

    if (this.keys.forward) moveZ -= 1;
    if (this.keys.backward) moveZ += 1;
    if (this.keys.left) moveX -= 1;
    if (this.keys.right) moveX += 1;

    if (joystickVector && (Math.abs(joystickVector.x) > 0.05 || Math.abs(joystickVector.y) > 0.05)) {
      moveX += joystickVector.x;
      moveZ += joystickVector.y;
    }

    const inputLen = Math.hypot(moveX, moveZ);
    const isMoving = inputLen > 0.05;
    const isRunning = isMoving && (this.keys.run || inputLen > 1.15);

    if (isMoving) {
      const normX = moveX / Math.max(1, inputLen);
      const normZ = moveZ / Math.max(1, inputLen);

      const sinYaw = Math.sin(cameraYaw);
      const cosYaw = Math.cos(cameraYaw);

      const worldDirX = normX * cosYaw + normZ * sinYaw;
      const worldDirZ = normZ * cosYaw - normX * sinYaw;

      const walkSpd = characterConfig?.movementSpeed || this.walkSpeed;
      const runSpd = characterConfig?.runSpeed || this.runSpeed;
      const speed = isRunning ? runSpd : walkSpd;

      x += worldDirX * speed * dt;
      z += worldDirZ * speed * dt;

      const targetRot = Math.atan2(worldDirX, worldDirZ);
      let diff = targetRot - rot;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      rot += diff * Math.min(1, dt * 12);
    }

    // Resolve physical + access-controlled collisions via CollisionSystem
    [x, z] = collisionSystem.resolvePlayerMovement({
      nextX: x,
      nextZ: z,
      prevX,
      prevZ,
      playerRadius: this.playerRadius,
      character: characterConfig,
      ticket,
      onRestrictedHit
    });

    // Jump & Airborne Restriction near Stage Barriers (Requirement 14)
    const nearBarrier = collisionSystem.isNearStageBarrier(x, z);
    if (this.keys.jump && this.isGrounded) {
      // Lower jump impulse near stage barrier so player can cheer-hop in place without ever vaulting the barrier height
      this.velocityY = nearBarrier ? 3.2 : this.jumpImpulse;
      this.isGrounded = false;
    }

    if (!this.isGrounded) {
      y += this.velocityY * dt;
      // Clamp max airborne height near barriers below stage deck elevation
      if (nearBarrier && y > 0.45) {
        y = 0.45;
        this.velocityY = Math.min(0, this.velocityY);
      }
      this.velocityY -= this.gravity * dt;
      if (y <= 0) {
        y = 0;
        this.velocityY = 0;
        this.isGrounded = true;
      }
    }

    return {
      position: [x, y, z],
      rotation: rot,
      isMoving,
      isRunning,
      isJumping: !this.isGrounded
    };
  }
}

export const movementSystem = new MovementSystem();
