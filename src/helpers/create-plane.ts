import { Plane } from '../types'
import { buildPlane } from './build-plane'

export function createPlane(params: Plane = {}) {
  const {
    width = 1,
    height = 1,
    widthSegments = 1,
    heightSegments = 1,
  } = params

  const wSegs = widthSegments
  const hSegs = heightSegments

  // Determine length of arrays
  const num = (wSegs + 1) * (hSegs + 1)
  const numIndices = wSegs * hSegs * 6

  // Generate interleaved array
  const verticesNormalUv = new Float32Array(num * 3 + num * 2)
  const indices =
    num > 65536 ? new Uint32Array(numIndices) : new Uint16Array(numIndices)

  let i = 0
  let ii = 0
  let io = i
  const segW = width / wSegs
  const segH = height / hSegs
  const uDir = 1
  const vDir = -1
  const depth = 0
  // pos + uv
  const vertexDivisor = 3 + 2

  for (let iy = 0; iy <= hSegs; iy++) {
    const y = iy * segH - height / 2
    for (let ix = 0; ix <= wSegs; ix++, i++) {
      const x = ix * segW - width / 2

      verticesNormalUv[i * vertexDivisor + 0] = x * uDir
      verticesNormalUv[i * vertexDivisor + 1] = y * vDir
      verticesNormalUv[i * vertexDivisor + 2] = depth / 2

      verticesNormalUv[i * vertexDivisor + 3] = ix / wSegs
      verticesNormalUv[i * vertexDivisor + 4] = iy / hSegs

      if (iy === hSegs || ix === wSegs) continue
      const a = io + ix + iy * (wSegs + 1)
      const b = io + ix + (iy + 1) * (wSegs + 1)
      const c = io + ix + (iy + 1) * (wSegs + 1) + 1
      const d = io + ix + iy * (wSegs + 1) + 1

      indices[ii * 6] = a
      indices[ii * 6 + 1] = b
      indices[ii * 6 + 2] = d
      indices[ii * 6 + 3] = b
      indices[ii * 6 + 4] = c
      indices[ii * 6 + 5] = d
      ii++
    }
  }

  return {
    vertexDivisor,
    verticesNormalUv,
    indices,
  }
}
