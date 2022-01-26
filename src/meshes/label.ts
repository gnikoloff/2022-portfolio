import { ShaderDefineValue, TextureAtlas } from '../lib/hwoa-rang-gl2'
import Quad from './quad'
import { LabelProps } from '../interfaces'
import { promisifiedLoadImage } from '../helpers'

import labelTransitionImageURL from '../assets/label-transition.png'
import labelTransitionImageURL2 from '../assets/label-transition2.png'
import { FONT_STACK } from '../constants'

export default class Label extends Quad {
  label: string
  texture: WebGLTexture | null = null
  maskTexture: WebGLTexture | null = null
  maskTexture2: WebGLTexture | null = null
  transparent = false
  supportHover = false

  static TEXTURE_SIZE = 1000

  static drawLabelToCanvas(
    label: string,
    textAlign: CanvasTextAlign,
    textColor: string | CanvasGradient | CanvasPattern,
    refFontSize: number,
    width = 400,
    height = 120,
  ): HTMLCanvasElement {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    // ctx.lineWidth = 10
    // ctx.strokeStyle = 'red'
    // ctx.strokeRect(0, 0, canvas.width, canvas.height)
    const stringToRender = label.trim()
    ctx.font = `${refFontSize}px ${FONT_STACK}`
    const textWidth = ctx.measureText(stringToRender).width
    const widthDelta = refFontSize / textWidth
    const fontSize = refFontSize * widthDelta
    ctx.font = `${fontSize} ${FONT_STACK}`
    ctx.fillStyle = textColor
    ctx.textBaseline = 'middle'
    const paddingLeft = 42
    ctx.textAlign = textAlign
    const x = textAlign === 'center' ? canvas.width / 2 : paddingLeft
    const y = height / 2
    ctx.fillText(stringToRender, x, y)
    return canvas
  }

  set revealMixFactor(v: number) {
    this.updateUniform('u_revealMixFactor', v)
  }

  set fadeFactor(v: number) {
    this.updateUniform('u_fadeMixFactor', v)
  }

  set hoverFactor(v: number) {
    if (!this.supportHover) {
      return
    }
    this.updateUniform('u_hoverMixFactor', v)
  }

  constructor(
    gl: WebGL2RenderingContext,
    {
      geometry,
      label,
      texWidth = Label.TEXTURE_SIZE,
      textAlign = 'left',
      textColor = 'white',
      fontSize = 50,
      transparent = false,
      supportHover = false,
    }: LabelProps,
  ) {
    const defines: { [key: string]: ShaderDefineValue } = {
      MESH_WIDTH: geometry.width,
      MESH_HEIGHT: geometry.height,
      USE_SHADING: true,
      USE_MODEL_MATRIX: true,
      USE_UV_TRANSFORM: true,
      USE_TEXTURE: true,
      SUPPORTS_FADING: true,
      USE_MASK_TEXTURE: true,
    }
    if (supportHover) {
      defines.SUPPORTS_HOVER_MASK_FX = true
    }
    super(gl, {
      geometry,
      defines,
      name: label,
    })
    this.label = label
    this.transparent = transparent
    this.supportHover = supportHover

    const { width, height } = geometry
    const aspect = width / height

    const texManager = TextureAtlas.getInstance()

    const packMaskTextureToAtlas = (
      transitionImage: HTMLImageElement,
    ): Promise<[Float32Array, WebGLTexture]> => {
      try {
        texManager.pack(transitionImage.src, transitionImage)
      } catch (err) {
        // ...
      }
      const [uvs, texture] = texManager.getUv2(transitionImage.src)
      if (!uvs) {
        throw new Error('could not allocate label mask texture')
      }
      return Promise.resolve([uvs, texture])
    }

    promisifiedLoadImage(labelTransitionImageURL)
      .then(packMaskTextureToAtlas)
      .then(([uvs, texture]) => {
        this.maskTexture = texture
        this.updateUniform(
          'u_uvOffsetSizesMask',
          new Float32Array([uvs[0], uvs[1], uvs[4], uvs[5]]),
        )
      })

    if (supportHover) {
      promisifiedLoadImage(labelTransitionImageURL2)
        .then(packMaskTextureToAtlas)
        .then(([uvs, texture]) => {
          this.maskTexture2 = texture
          this.updateUniform(
            'u_uvOffsetSizesHoverMask',
            new Float32Array([uvs[0], uvs[1], uvs[4], uvs[5]]),
          )
        })
    }

    const texHeight = texWidth / aspect
    const atlasID = `label-${label}`
    const labelImage = Label.drawLabelToCanvas(
      label,
      textAlign,
      textColor,
      fontSize,
      texWidth,
      texHeight,
    )
    try {
      texManager.pack(atlasID, labelImage)
    } catch {
      // already packed
    }
    const [uvs, texture] = texManager.getUv2(atlasID)
    if (!uvs) {
      throw new Error('mega texture allocation failed')
    }
    this.texture = texture

    this.setUniform('u_revealMixFactor', {
      type: gl.FLOAT,
      value: 0,
    })
    this.setUniform('u_fadeMixFactor', {
      type: gl.FLOAT,
      value: 1,
    })
    if (supportHover) {
      this.setUniform('u_hoverMixFactor', {
        type: gl.FLOAT,
        value: 0,
      })

      this.setUniform('u_uvOffsetSizesHoverMask', {
        type: gl.FLOAT_VEC4,
      })

      this.setUniform('u_maskTexture2', {
        type: gl.INT,
        value: 2,
      })
    }
    this.setUniform('u_uvOffsetSizes', {
      type: gl.FLOAT_VEC4,
      value: new Float32Array([uvs[0], uvs[1], uvs[4], uvs[5]]),
    })
    this.setUniform('u_diffuse', {
      type: gl.INT,
      value: 0,
    })
    this.setUniform('u_maskTexture', {
      type: gl.INT,
      value: 1,
    })
    this.setUniform('u_uvOffsetSizesMask', {
      type: gl.FLOAT_VEC4,
    })
  }

  render(cameraUBOBindPoint = 0): void {
    if (!this._visible) {
      return
    }
    this.preRender(cameraUBOBindPoint)

    const gl = this.gl

    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, this.texture)

    gl.activeTexture(gl.TEXTURE1)
    gl.bindTexture(gl.TEXTURE_2D, this.maskTexture)

    if (this.supportHover) {
      gl.activeTexture(gl.TEXTURE2)
      gl.bindTexture(gl.TEXTURE_2D, this.maskTexture2)
    }

    if (this.transparent) {
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
      gl.enable(gl.BLEND)
      gl.disable(gl.DEPTH_TEST)
    }

    gl.bindVertexArray(this.vao)
    gl.drawElements(gl.TRIANGLES, this.vertexCount, gl.UNSIGNED_SHORT, 0)

    if (this.transparent) {
      gl.disable(gl.BLEND)
      gl.enable(gl.DEPTH_TEST)
    }
  }
}
