import { vec3 } from 'gl-matrix'
import {
  Drawable,
  PlaneGeometry,
  ShaderDefineValue,
} from '../lib/hwoa-rang-gl2/dist'

export default class Quad extends Drawable {
  cameraUBOIndex: GLuint
  protected _worldSpaceVertPositions!: [vec3, vec3, vec3, vec3]

  get cornersInWorldSpace(): [vec3, vec3, vec3, vec3] {
    if (this._worldSpaceVertPositions && !this.shouldUpdate) {
      return this._worldSpaceVertPositions
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
    this._worldSpaceVertPositions = [pos0, pos1, pos2, pos3]
    return this._worldSpaceVertPositions
  }

  constructor(
    gl: WebGL2RenderingContext,
    geometry: PlaneGeometry,
    vertexShaderSource: string,
    fragmentShaderSource: string,
    shaderDefines: { [name: string]: ShaderDefineValue },
    name?: string,
  ) {
    super(gl, vertexShaderSource, fragmentShaderSource, shaderDefines, name)
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

  preRender(cameraUBOBindPoint = 0) {
    const gl = this.gl
    gl.uniformBlockBinding(
      this.program,
      this.cameraUBOIndex,
      cameraUBOBindPoint,
    )
    gl.useProgram(this.program)
    this.uploadWorldMatrix()
  }
}
