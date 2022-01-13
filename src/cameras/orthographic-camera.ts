import { mat4 } from 'gl-matrix'
import Camera from './camera'

export default class OrthographicCamera extends Camera {
  left: number
  right: number
  bottom: number
  top: number
  near: number
  far: number

  constructor(
    left: number,
    right: number,
    top: number,
    bottom: number,
    near: number,
    far: number,
  ) {
    super()
    this.left = left
    this.right = right
    this.top = top
    this.bottom = bottom
    this.near = near
    this.far = far
    this.updateProjectionMatrix()
  }

  updateProjectionMatrix(): this {
    mat4.ortho(
      this.projectionMatrix,
      this.left,
      this.right,
      this.bottom,
      this.top,
      this.near,
      this.far,
    )
    return this
  }
}
