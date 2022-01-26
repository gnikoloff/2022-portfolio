import { CAMERA_FAR } from '../constants'
import { createPlane } from '../lib/hwoa-rang-gl2'
import store from '../store'

import Quad from './quad'

export default class Floor extends Quad {
  constructor(gl: WebGL2RenderingContext) {
    const size = CAMERA_FAR * 2
    const geometry = createPlane({
      width: size,
      height: size,
    })
    const {
      ui: { backgroundColor: bgColor },
    } = store.getState()
    const defines = {
      IS_FOG: true,
      USE_SOLID_COLOR: true,
      BACKGROUND_COLOR: `vec4(${bgColor[0]}, ${bgColor[1]}, ${bgColor[2]}, ${bgColor[3]})`,
    }
    super(gl, { geometry, defines, name: 'floor' })

    this.setPosition([0, -28, 0])
      .setRotation([Math.PI * 0.5, 0, 0])
      .updateWorldMatrix()

    this.setUniform('u_solidColor', {
      type: gl.FLOAT_VEC4,
      value: new Float32Array([0.2, 0.2, 0.2, 1]),
    })

    // const size = 300
    // const { interleavedArray, indicesArray, vertexStride, vertexCount } =
  }
}
