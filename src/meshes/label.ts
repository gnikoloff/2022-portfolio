import { vec3 } from 'gl-matrix'
import { LabelProps } from '../interfaces'
import { Drawable } from '../lib/hwoa-rang-gl2/dist'

import VERTEX_SHADER_SRC from '../shaders/uberShader.vert'
import FRAGMENT_SHADER_SRC from '../shaders/uberShader.frag'

export default class Label extends Drawable {
  cameraUBOIndex: GLuint
  label: string

  #worldSpaceVertPositions!: [vec3, vec3, vec3, vec3]

  get cornersInWorldSpace(): [vec3, vec3, vec3, vec3] {
    if (this.#worldSpaceVertPositions && !this.shouldUpdate) {
      return this.#worldSpaceVertPositions
    }
    const labelWidth = this.boundingBox.max[0] - this.boundingBox.min[0]
    const labelHeight = this.boundingBox.max[1] - this.boundingBox.min[1]
    const pos0 = vec3.fromValues(-labelWidth / 2, labelHeight / 2, 0)
    const pos1 = vec3.fromValues(-labelWidth / 2, -labelHeight / 2, 0)
    const pos2 = vec3.fromValues(labelWidth / 2, -labelHeight / 2, 0)
    const pos3 = vec3.fromValues(labelWidth / 2, labelHeight / 2, 0)
    vec3.transformMat4(pos0, pos0, this.worldMatrix)
    vec3.transformMat4(pos1, pos1, this.worldMatrix)
    vec3.transformMat4(pos2, pos2, this.worldMatrix)
    vec3.transformMat4(pos3, pos3, this.worldMatrix)
    this.#worldSpaceVertPositions = [pos0, pos1, pos2, pos3]

    return this.#worldSpaceVertPositions
  }

  constructor(gl: WebGL2RenderingContext, { geometry, label }: LabelProps) {
    super(gl, VERTEX_SHADER_SRC, FRAGMENT_SHADER_SRC, {
      USE_SHADING: true,
      USE_MODEL_MATRIX: true,
    })
    this.label = label

    const {
      interleavedArray,
      indicesArray,
      vertexStride,
      vertexCount,
      width,
      height,
    } = geometry

    this.vertexCount = vertexCount

    this.boundingBox = {
      min: [-width / 2, height / 2, 0],
      max: [width / 2, -height / 2, 0],
    }

    const interleavedBuffer = gl.createBuffer()
    const indexBuffer = gl.createBuffer()

    const aPositionLoc = gl.getAttribLocation(this.program, 'aPosition')
    const aUvLoc = gl.getAttribLocation(this.program, 'aUv')

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

    // uv
    gl.enableVertexAttribArray(aUvLoc)
    gl.vertexAttribPointer(
      aUvLoc,
      2,
      gl.FLOAT,
      false,
      vertexStride * Float32Array.BYTES_PER_ELEMENT,
      3 * Float32Array.BYTES_PER_ELEMENT,
    )

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indicesArray, gl.STATIC_DRAW)

    this.cameraUBOIndex = gl.getUniformBlockIndex(this.program, 'Camera')
  }

  render(timeMS: DOMHighResTimeStamp): void {
    const gl = this.gl
    gl.uniformBlockBinding(this.program, this.cameraUBOIndex, 0)
    gl.useProgram(this.program)
    this.uploadWorldMatrix()

    gl.bindVertexArray(this.vao)
    gl.drawElements(gl.TRIANGLES, this.vertexCount, gl.UNSIGNED_SHORT, 0)
  }
}
