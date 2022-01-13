import { mat4, vec3 } from 'gl-matrix'

/**
 * Base transform class to handle vectors and matrices
 * Taken from my webgl library:
 * https://github.com/gnikoloff/hwoa-rang-gl/blob/main/src/core/transform.ts
 * @public
 */
export class Transform {
  public position = vec3.fromValues(0, 0, 0)
  public rotation = vec3.fromValues(0, 0, 0)
  public scale = vec3.fromValues(1, 1, 1)

  public modelMatrix = mat4.create()
  public shouldUpdate = true

  copyFromMatrix(matrix: mat4) {
    mat4.copy(this.modelMatrix, matrix)
    this.shouldUpdate = false
    return this
  }

  setPosition(position: vec3): this {
    vec3.copy(this.position, position)
    this.shouldUpdate = true
    return this
  }

  setScale(scale: vec3): this {
    vec3.copy(this.scale, scale)
    this.shouldUpdate = true
    return this
  }

  setRotation(rotation: vec3): this {
    vec3.copy(this.rotation, rotation)
    this.shouldUpdate = true
    return this
  }

  updateModelMatrix(): this {
    mat4.identity(this.modelMatrix)
    mat4.translate(this.modelMatrix, this.modelMatrix, this.position)
    mat4.rotateX(this.modelMatrix, this.modelMatrix, this.rotation[0])
    mat4.rotateY(this.modelMatrix, this.modelMatrix, this.rotation[1])
    mat4.rotateZ(this.modelMatrix, this.modelMatrix, this.rotation[2])
    mat4.scale(this.modelMatrix, this.modelMatrix, this.scale)
    this.shouldUpdate = false
    return this
  }
}
