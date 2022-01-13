import { vec3 } from 'gl-matrix'
import { BoundingBox, Renderable } from '../lib/hwoa-rang-gl2/dist'

export default class ProjectThumb extends Renderable {
  boundingBox: BoundingBox

  get AABB(): BoundingBox {
    const min = vec3.clone(this.boundingBox.min)
    const max = vec3.clone(this.boundingBox.max)
    vec3.transformMat4(min, min, this.worldMatrix)
    vec3.transformMat4(max, max, this.worldMatrix)
    return { min, max }
  }

  constructor(gl: WebGL2RenderingContext, { geometry }: GeometryProps) {
    super(gl, geometry.vertexCount, {
      USE_SHADING: true,
      USE_MODEL_MATRIX: true,
    })

    const {
      interleavedArray,
      indicesArray,
      width,
      height,
      depth,
      vertexStride,
    } = geometry

    this.boundingBox = {
      min: vec3.fromValues(-width / 2, -height / 2, -depth / 2),
      max: vec3.fromValues(width / 2, height / 2, depth / 2),
    }

    const interleavedBuffer = gl.createBuffer()
    const indexBuffer = gl.createBuffer()

    const aPositionLoc = gl.getAttribLocation(this.drawProgram, 'aPosition')
    const aNormalLoc = gl.getAttribLocation(this.drawProgram, 'aNormal')
    const aUvLoc = gl.getAttribLocation(this.drawProgram, 'aUv')

    gl.bindVertexArray(this.vao)

    gl.bindBuffer(gl.ARRAY_BUFFER, interleavedBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, interleavedArray, gl.STATIC_DRAW)

    // pos
    gl.enableVertexAttribArray(aPositionLoc)
    gl.vertexAttribPointer(
      aPositionLoc,
      3,
      gl.FLOAT,
      false,
      vertexStride * Float32Array.BYTES_PER_ELEMENT,
      0,
    )
    // normal
    gl.enableVertexAttribArray(aNormalLoc)
    gl.vertexAttribPointer(
      aNormalLoc,
      3,
      gl.FLOAT,
      false,
      vertexStride * Float32Array.BYTES_PER_ELEMENT,
      3 * Float32Array.BYTES_PER_ELEMENT,
    )
    // uv
    gl.enableVertexAttribArray(aUvLoc)
    gl.vertexAttribPointer(
      aUvLoc,
      2,
      gl.FLOAT,
      false,
      vertexStride * Float32Array.BYTES_PER_ELEMENT,
      6 * Float32Array.BYTES_PER_ELEMENT,
    )

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indicesArray, gl.STATIC_DRAW)
  }

  render(): void {
    const gl = this.gl

    // console.log(this.worldMatrix)

    gl.uniformBlockBinding(this.drawProgram, this.cameraUBOIndex, 0)
    gl.useProgram(this.drawProgram)
    gl.bindVertexArray(this.vao)

    if (this.shouldUploadModelMatrix) {
      gl.uniformMatrix4fv(this.modelMatrixLocation, false, this.worldMatrix)
      this.shouldUploadModelMatrix = false
    }

    gl.drawElements(gl.TRIANGLES, this.vertexCount, gl.UNSIGNED_SHORT, 0)

    this.children.forEach((child) => child.render())
  }
}
