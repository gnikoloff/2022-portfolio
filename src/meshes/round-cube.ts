import { vec3 } from 'gl-matrix'
import { Drawable, BoundingBox } from '../lib/hwoa-rang-gl2/dist'
import { RoundCubeProps } from '../interfaces'

import VERTEX_SHADER_SRC from '../shaders/uberShader.vert'
import FRAGMENT_SHADER_SRC from '../shaders/uberShader.frag'

export default class RoundCube extends Drawable {
  cameraUBOIndex: GLuint

  get AABB(): BoundingBox {
    const min = vec3.clone(this.boundingBox.min)
    const max = vec3.clone(this.boundingBox.max)
    vec3.transformMat4(min, min, this.worldMatrix)
    vec3.transformMat4(max, max, this.worldMatrix)
    return { min, max }
  }

  set deformationAngle(deformAngle: number) {
    const gl = this.gl
    gl.useProgram(this.program)
    gl.uniform1f(this.uniformLocations.deformAngle, deformAngle)
  }

  constructor(
    gl: WebGL2RenderingContext,
    { geometry, solidColor }: RoundCubeProps,
  ) {
    const defines = {
      USE_SHADING: true,
      USE_MODEL_MATRIX: true,
      USE_SOLID_COLOR: !!solidColor,
      USE_DEFORM: true,
    }
    super(gl, VERTEX_SHADER_SRC, FRAGMENT_SHADER_SRC, defines)

    const {
      interleavedArray,
      indicesArray,
      width,
      height,
      depth,
      vertexStride,
      vertexCount,
    } = geometry

    this.vertexCount = vertexCount

    this.boundingBox = {
      min: vec3.fromValues(-width / 2, -height / 2, -depth / 2),
      max: vec3.fromValues(width / 2, height / 2, depth / 2),
    }

    this.uniformLocations.deformAngle = gl.getUniformLocation(
      this.program,
      'deformAngle',
    )!

    const interleavedBuffer = gl.createBuffer()
    const indexBuffer = gl.createBuffer()

    const aPositionLoc = gl.getAttribLocation(this.program, 'aPosition')
    const aNormalLoc = gl.getAttribLocation(this.program, 'aNormal')
    const aUvLoc = gl.getAttribLocation(this.program, 'aUv')

    if (solidColor) {
      const solidColorUniformLocation = gl.getUniformLocation(
        this.program,
        'solidColor',
      )
      gl.useProgram(this.program)
      gl.uniform4f(
        solidColorUniformLocation,
        solidColor[0],
        solidColor[1],
        solidColor[2],
        solidColor[3],
      )
      gl.useProgram(null)
    }

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
