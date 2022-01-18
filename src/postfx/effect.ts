import {
  createPlane,
  OrthographicCamera,
  ShaderDefineValue,
} from '../lib/hwoa-rang-gl2/dist'
import Quad from '../meshes/quad'

import VERTEX_SHADER_SRC from '../shaders/uberShader.vert'
import FRAGMENT_SHADER_SRC from '../shaders/uberShader.frag'
import { vec2 } from 'gl-matrix'

const fullscreenQuadGeo = createPlane({
  width: innerWidth,
  height: innerHeight,
  flipUVy: true,
})
const orthographicCamera = new OrthographicCamera(
  -innerWidth / 2,
  innerWidth / 2,
  innerHeight / 2,
  -innerHeight / 2,
  0.1,
  20,
)
orthographicCamera.position = [0, 0, 1]
orthographicCamera.lookAt = [0, 0, 0]
orthographicCamera.updateViewMatrix().updateProjectionViewMatrix()

let cameraNeedsUpdate = false

export default class Effect extends Quad {
  texture: WebGLTexture
  framebuffer: WebGLFramebuffer

  protected _viewportSize: vec2 = [innerWidth, innerHeight]

  constructor(
    gl: WebGL2RenderingContext,
    defines: { [name: string]: ShaderDefineValue } = {},
  ) {
    super(gl, fullscreenQuadGeo, VERTEX_SHADER_SRC, FRAGMENT_SHADER_SRC, {
      // USE_MODEL_MATRIX: true,
      USE_TEXTURE: true,
      ...defines,
    })

    this.uniformLocations.u_diffuse = gl.getUniformLocation(
      this.program,
      'u_diffuse',
    )!
    gl.useProgram(this.program)
    gl.uniform1i(this.uniformLocations.u_diffuse, 0)

    const targetTextureWidth = innerWidth
    const targetTextureHeight = innerHeight

    this.texture = gl.createTexture()!
    gl.bindTexture(gl.TEXTURE_2D, this.texture)
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGB,
      targetTextureWidth,
      targetTextureHeight,
      0,
      gl.RGB,
      gl.UNSIGNED_BYTE,
      null,
    )
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameterf(gl.TEXTURE_2D, gl.UNPACK_FLIP_Y_WEBGL, 0)
    gl.bindTexture(gl.TEXTURE_2D, null)

    this.framebuffer = gl.createFramebuffer()!
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer)
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      this.texture,
      0,
    )

    const depthBuffer = gl.createRenderbuffer()
    gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer)

    // make a depth buffer and the same size as the targetTexture
    gl.renderbufferStorage(
      gl.RENDERBUFFER,
      gl.DEPTH_COMPONENT16,
      targetTextureWidth,
      targetTextureHeight,
    )
    gl.framebufferRenderbuffer(
      gl.FRAMEBUFFER,
      gl.DEPTH_ATTACHMENT,
      gl.RENDERBUFFER,
      depthBuffer,
    )

    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  }

  setViewportSize(width: number, height: number) {
    vec2.set(this._viewportSize, width, height)
  }

  bind(): this {
    const gl = this.gl
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer)
    return this
  }

  unbind(): this {
    const gl = this.gl
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    return this
  }

  clear(): this {
    const gl = this.gl
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    return this
  }

  toggleDepth(depth = true): this {
    const gl = this.gl
    depth ? gl.enable(gl.DEPTH_TEST) : gl.disable(gl.DEPTH)
    return this
  }

  render(): void {
    this.preRender(1)
    const gl = this.gl

    gl.viewport(0, 0, this._viewportSize[0], this._viewportSize[1])

    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, this.texture)

    gl.bindVertexArray(this.vao)
    gl.drawElements(gl.TRIANGLES, this.vertexCount, gl.UNSIGNED_SHORT, 0)

    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
  }
}
