import { MegaTexture } from '../lib/hwoa-rang-gl2/dist'
import Quad from './quad'
import { LabelProps } from '../interfaces'

import VERTEX_SHADER_SRC from '../shaders/uberShader.vert'
import FRAGMENT_SHADER_SRC from '../shaders/uberShader.frag'

export default class Label extends Quad {
  label: string
  textureAtlas: WebGLTexture | null = null

  static TEXTURE_SIZE = 600

  static drawLabelToCanvas(
    label: string,
    width = 400,
    height = 120,
  ): HTMLCanvasElement {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')!
    ctx.font = '32px Helvetica'
    ctx.fillStyle = 'white'
    ctx.textBaseline = 'middle'
    ctx.fillText(label, 10, height / 2)
    return canvas
  }

  set fadeFactor(v: number) {
    const gl = this.gl
    gl.useProgram(this.program)
    gl.uniform1f(this.uniformLocations.uFadeMixFactor, v)
  }

  constructor(gl: WebGL2RenderingContext, { geometry, label }: LabelProps) {
    super(
      gl,
      geometry,
      VERTEX_SHADER_SRC,
      FRAGMENT_SHADER_SRC,
      {
        USE_SHADING: true,
        USE_MODEL_MATRIX: true,
        USE_UV_TRANSFORM: true,
        USE_TEXTURE: true,
      },
      label,
    )
    this.label = label

    const { width, height } = geometry
    const aspect = width / height

    const texManager = MegaTexture.getInstance()
    const texWidth = Label.TEXTURE_SIZE
    const texHeight = texWidth / aspect
    const atlasID = `label-${label}`
    const labelImage = Label.drawLabelToCanvas(label, texWidth, texHeight)
    texManager.pack(atlasID, labelImage)
    const [uvs, texture] = texManager.getUv2(atlasID)
    if (!uvs) {
      throw new Error('mega texture allocation failed')
    }
    this.textureAtlas = texture

    this.uniformLocations.uFadeMixFactor = gl.getUniformLocation(
      this.program,
      'u_fadeMixFactor',
    )!

    const uvOffsetLocation = gl.getUniformLocation(
      this.program,
      'u_uvOffsetSizes',
    )!
    const uTextureSize = gl.getUniformLocation(this.program, 'u_textureSize')!

    const textureAtlasLocation = gl.getUniformLocation(
      this.program,
      'u_diffuse',
    )!

    gl.useProgram(this.program)
    gl.uniform4f(uvOffsetLocation, uvs[0], uvs[1], uvs[4], uvs[5])
    gl.uniform2f(uTextureSize, labelImage.width, labelImage.height)
    gl.uniform1i(textureAtlasLocation, 0)
    gl.uniform1f(this.uniformLocations.uFadeMixFactor, 1)
  }

  render(): void {
    this.preRender()

    const gl = this.gl

    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, this.textureAtlas)

    gl.bindVertexArray(this.vao)
    gl.drawElements(gl.TRIANGLES, this.vertexCount, gl.UNSIGNED_SHORT, 0)
  }
}
