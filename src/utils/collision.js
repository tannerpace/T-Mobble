/**
 * Collision detection utilities
 */

/**
 * AABB (Axis-Aligned Bounding Box) collision detection
 */
export function checkCollision(entityA, entityB) {
  return (
    entityA.x < entityB.x + entityB.width &&
    entityA.x + entityA.width > entityB.x &&
    entityA.y < entityB.y + entityB.height &&
    entityA.y + entityA.height > entityB.y
  );
}

/**
 * Check if entity is off screen (left side)
 */
export function isOffScreenLeft(entity) {
  return entity.x + entity.width < 0;
}

/**
 * Check if entity is off screen (right side)
 */
export function isOffScreenRight(entity, canvasWidth) {
  return entity.x > canvasWidth;
}
