import { mat4, vec3, vec4 } from 'gl-matrix'
import { Drawable } from '../lib/hwoa-rang-gl2/dist'

import VERTEX_SHADER_SRC from '../shaders/uberShader.vert'
import FRAGMENT_SHADER_SRC from '../shaders/uberShader.frag'

export default class Line extends Drawable {
  cameraUBOIndex: GLuint
  startVec3: vec3
  endVec3: vec3

  constructor(
    gl: WebGL2RenderingContext,
    startVec3: vec3,
    endVec3: vec3,
    color: vec4 = [1, 0, 0, 1],
  ) {
    super(gl, VERTEX_SHADER_SRC, FRAGMENT_SHADER_SRC, {
      USE_SOLID_COLOR: true,
    })

    this.setUniform('u_solidColor', {
      type: gl.FLOAT_VEC4,
      value: new Float32Array([1, 0, 0, 1]),
    })
    this.setUniform('u_worldMatrix', {
      type: gl.FLOAT_MAT4,
      value: mat4.create() as Float32Array,
    })

    this.startVec3 = startVec3
    this.endVec3 = endVec3

    const aPositionLocation = gl.getAttribLocation(this.program, 'aPosition')

    const solidColorUniformLocation = gl.getUniformLocation(
      this.program,
      'solidColor',
    )
    gl.useProgram(this.program)
    gl.uniform4f(
      solidColorUniformLocation,
      color[0],
      color[1],
      color[2],
      color[3],
    )
    gl.useProgram(null)

    const vertices = new Float32Array([...startVec3, ...endVec3])
    const vertexBuffer = gl.createBuffer()

    gl.bindVertexArray(this.vao)
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)
    gl.enableVertexAttribArray(aPositionLocation)
    gl.vertexAttribPointer(aPositionLocation, 3, gl.FLOAT, false, 0, 0)
    gl.bindVertexArray(null)

    this.cameraUBOIndex = gl.getUniformBlockIndex(this.program, 'Camera')
  }

  render() {
    const gl = this.gl
    gl.uniformBlockBinding(this.program, this.cameraUBOIndex, 0)
    gl.useProgram(this.program)
    gl.bindVertexArray(this.vao)
    gl.drawArrays(gl.LINES, 0, 2)
    gl.bindVertexArray(null)
  }
}
