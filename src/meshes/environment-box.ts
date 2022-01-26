import { createBox, Drawable } from '../lib/hwoa-rang-gl2'

import VERTEX_SHADER_SRC from '../shaders/uberShader.vert'
import FRAGMENT_SHADER_SRC from '../shaders/uberShader.frag'
import { EnvBoxProps } from '../interfaces'

export default class EnvironmentBox extends Drawable {
  cameraUBOIndex: GLuint
  constructor(
    gl: WebGL2RenderingContext,
    { width = 100, height = 70, depth = 70 }: EnvBoxProps = {},
  ) {
    super(gl, VERTEX_SHADER_SRC, FRAGMENT_SHADER_SRC, {}, 'environment-box')
    const { interleavedArray, indicesArray, vertexStride, vertexCount } =
      createBox({
        width,
        height,
        depth,
        widthSegments: 20,
        heightSegments: 20,
        depthSegments: 20,
      })
    this.vertexCount = vertexCount

    // attribs
    const interleavedBuffer = gl.createBuffer()
    const indexBuffer = gl.createBuffer()

    const aPositionLoc = gl.getAttribLocation(this.program, 'aPosition')
    const aUvLoc = gl.getAttribLocation(this.program, 'aUv')

    gl.bindVertexArray(this.vao)

    gl.bindBuffer(gl.ARRAY_BUFFER, interleavedBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, interleavedArray, gl.STATIC_DRAW)

    gl.enableVertexAttribArray(aPositionLoc)
    gl.vertexAttribPointer(
      aPositionLoc,
      3,
      gl.FLOAT,
      false,
      vertexStride * Float32Array.BYTES_PER_ELEMENT,
      0,
    )

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

    // uniforms
    // this.updateUniform(
    //   Drawable.WORLD_MATRIX_UNIFORM_NAME,
    //   mat4.create() as Float32Array,
    // )
    // this.setPosition([0, -DEF_RADIUS * 0.2, 0])
    this.updateWorldMatrix()

    this.cameraUBOIndex = gl.getUniformBlockIndex(this.program, 'Camera')
  }
  render() {
    const gl = this.gl
    gl.uniformBlockBinding(this.program, this.cameraUBOIndex, 0)
    gl.useProgram(this.program)
    this.uploadWorldMatrix()

    gl.enable(gl.CULL_FACE)
    gl.cullFace(gl.FRONT)

    gl.bindVertexArray(this.vao)
    gl.drawElements(gl.TRIANGLES, this.vertexCount, gl.UNSIGNED_SHORT, 0)

    gl.disable(gl.CULL_FACE)
  }
}
