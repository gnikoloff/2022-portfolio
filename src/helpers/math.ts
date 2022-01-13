import { mat4, vec2, vec3, vec4 } from 'gl-matrix'
import PerspectiveCamera from '../cameras/perspective-camera'
import { BoundingBox } from '../types'

/**
 * Clamp number to a given range
 * @param {number} num
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export const clamp = (num: number, min: number, max: number): number =>
  Math.min(Math.max(num, min), max)

/**
 *
 * @param {number} val
 * @param {number} inMin
 * @param {number} inMax
 * @param {number} outMin
 * @param {number} outMax
 * @returns {number}
 */
export const mapNumberRange = (
  val: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
): number => {
  return ((val - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin
}

/**
 * Check if number is power of 2
 * @param {number} value
 * @returns {number}
 */
export const isPowerOf2 = (value: number): boolean =>
  (value & (value - 1)) === 0

/**
 * Normalizes a number
 * @param {number} min
 * @param {number} max
 * @param {number} val
 * @returns {number}
 */
export const normalizeNumber = (
  min: number,
  max: number,
  val: number,
): number => (val - min) / (max - min)

/**
 *
 * @param {number} t
 * @returns {number}
 */
export const triangleWave = (t: number): number => {
  t -= Math.floor(t * 0.5) * 2
  t = Math.min(Math.max(t, 0), 2)
  return 1 - Math.abs(t - 1)
}

/**
 * Convert degree to radian
 * @param {number} deg
 * @returns {number}
 */
export const deg2Rad = (deg: number): number => (deg * Math.PI) / 180

const vec4Clip = vec4.create()
const vec4Eye = vec4.create()
const vec4World = vec4.create()
const ray = vec3.create()
const rayStart = vec3.create()
const rayEnd = vec3.create()
const rayMul = vec3.create()
const rayDirection = vec3.create()
const matInvProjection = mat4.create()

// https://stackoverflow.com/questions/20140711/picking-in-3d-with-ray-tracing-using-ninevehgl-or-opengl-i-phone
/**
 * Project a mouse coord in NDC space to world space
 * @param {vec2} normMouseCoords
 * @param {PerspectiveCamera} camera
 * @param {number} rayScale
 * @returns
 */
export const projectMouseToWorldSpace = (
  normMouseCoords: vec2,
  camera: PerspectiveCamera,
  rayScale = 999,
) => {
  const normX = normMouseCoords[0]
  const normY = normMouseCoords[1]
  // Homogeneous clip coordinates
  vec4.set(vec4Clip, normX, normY, -1, 1)
  // 4D eye (camera) coordinates
  vec4.zero(vec4Eye)
  mat4.invert(matInvProjection, camera.projectionMatrix)
  vec4.transformMat4(vec4Eye, vec4Clip, matInvProjection)
  vec4Eye[2] = -1
  vec4Eye[3] = 0
  // 4D world coordinates
  vec4.zero(vec4World)
  vec4.transformMat4(vec4World, vec4Eye, camera.viewMatrixInverse)
  vec3.set(ray, vec4World[0], vec4World[1], vec4World[2])
  vec3.normalize(ray, ray)
  // get rayStart and rayEnd
  vec3.set(rayStart, camera.position[0], camera.position[1], camera.position[2])
  vec3.copy(rayEnd, rayStart)
  vec3.copy(rayMul, ray)
  vec3.scale(rayMul, ray, rayScale)
  vec3.add(rayEnd, rayStart, rayMul)
  // get direction between two points
  vec3.zero(rayDirection)
  vec3.subtract(rayDirection, rayEnd, rayStart)

  return {
    rayStart,
    rayEnd,
    rayDirection,
  }
}

// https://gdbooks.gitbooks.io/3dcollisions/content/Chapter3/raycast_aabb.html
/**
 * Test ray against Axis Aligned Bounding Box
 * @param {BoundingBox} box
 * @param {vec3} origin
 * @param {vec3} direction
 * @returns
 */
export const intersectRayWithAABB = (
  box: BoundingBox,
  origin: vec3,
  direction: vec3,
): [number, boolean] => {
  const tMinX = (box.min[0] - origin[0]) / direction[0]
  const tMaxX = (box.max[0] - origin[0]) / direction[0]
  const tMinY = (box.min[1] - origin[1]) / direction[1]
  const tMaxY = (box.max[1] - origin[1]) / direction[1]
  const tMinZ = (box.min[2] - origin[2]) / direction[2]
  const tMaxZ = (box.max[2] - origin[2]) / direction[2]
  const tmin = Math.max(
    Math.max(Math.min(tMinX, tMaxX), Math.min(tMinY, tMaxY)),
    Math.min(tMinZ, tMaxZ),
  )
  const tmax = Math.min(
    Math.min(Math.max(tMinX, tMaxX), Math.max(tMinY, tMaxY)),
    Math.max(tMinZ, tMaxZ),
  )

  let t: number

  if (tmax < 0) {
    t = tmax
    return [t, false]
  }

  if (tmin > tmax) {
    t = tmax
    return [t, false]
  }

  t = tmin
  return [t, true]
}
