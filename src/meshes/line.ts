import { vec3, vec4 } from 'gl-matrix'
import { Drawable } from '../lib/hwoa-rang-gl2/dist'

export default class Line extends Drawable {
  startVec3: vec3
  endVec3: vec3

  constructor(
    gl: WebGL2RenderingContext,
    startVec3: vec3,
    endVec3: vec3,
    color: vec4 = [1, 0, 0, 1],
  ) {
    super(gl, {
      USE_SOLID_COLOR: true,
    })

    this.startVec3 = startVec3
    this.endVec3 = endVec3

    const aPositionLocation = gl.getAttribLocation(
      this.drawProgram,
      'aPosition',
    )

    const solidColorUniformLocation = gl.getUniformLocation(
      this.drawProgram,
      'solidColor',
    )
    gl.useProgram(this.drawProgram)
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
  }

  render() {
    const gl = this.gl
    gl.useProgram(this.drawProgram)
    gl.bindVertexArray(this.vao)
    gl.drawArrays(gl.LINES, 0, 2)
    gl.bindVertexArray(null)
  }
}
