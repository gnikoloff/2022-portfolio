import { mat4 } from 'gl-matrix'
import Camera from './camera'

export default class PerspectiveCamera extends Camera {
  fieldOfView: number
  aspect: number
  near: number
  far: number

  constructor(fieldOfView: number, aspect: number, near: number, far: number) {
    super()
    this.fieldOfView = fieldOfView
    this.aspect = aspect
    this.near = near
    this.far = far
    this.updateProjectionMatrix()
  }

  updateProjectionMatrix(): this {
    mat4.perspective(
      this.projectionMatrix,
      this.fieldOfView,
      this.aspect,
      this.near,
      this.far,
    )
    return this
  }
}
