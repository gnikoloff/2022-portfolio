import { vec3 } from 'gl-matrix'
import Drawable from './drawable'

export default class RaycastLine extends Drawable {
  constructor(gl: WebGL2RenderingContext, startVec3: vec3, endVec3: vec3) {
    super(gl, {
      USE_SOLID_COLOR: true,
    })

    const aPositionLocation = gl.getAttribLocation(
      this.drawProgram,
      'aPosition',
    )

    const solidColorUniformLocation = gl.getUniformLocation(
      this.drawProgram,
      'solidColor',
    )
    gl.useProgram(this.drawProgram)
    gl.uniform4f(solidColorUniformLocation, 1, 0, 0, 1)
    gl.useProgram(null)

    const vertices = new Float32Array([...startVec3, ...endVec3])
    const vertexBuffer = gl.createBuffer()

    gl.bindVertexArray(this.vao)
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)
    gl.enableVertexAttribArray(aPositionLocation)
    gl.vertexAttribPointer(aPositionLocation, 3, gl.FLOAT, false, 0, 0)
    gl.bindVertexArray(null)
  }

  render() {
    const gl = this.gl
    gl.useProgram(this.drawProgram)
    gl.bindVertexArray(this.vao)
    gl.drawArrays(gl.LINES, 0, 2)
    gl.bindVertexArray(null)
  }
}
