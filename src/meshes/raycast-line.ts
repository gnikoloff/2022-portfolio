import { vec3 } from 'gl-matrix'
import { PerspectiveCamera } from '../lib/hwoa-rang-gl2/dist'
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
    // gl.uniformMatrix4fv(
    //   this.viewProjectionMatrixLocation,
    //   false,
    //   camera.projectionViewMatrix,
    // )
    gl.drawArrays(gl.LINES, 0, 2)
    gl.bindVertexArray(null)
  }
}
