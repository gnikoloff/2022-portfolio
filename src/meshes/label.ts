import { TextureAtlas } from '../lib/hwoa-rang-gl2'
import Quad from './quad'
import { LabelProps } from '../interfaces'
import { promisifiedLoadImage } from '../helpers'
import { LABEL_HEIGHT, LABEL_WIDTH } from '../constants'

import labelTransitionImageURL from '../assets/label-transition.png'

export default class Label extends Quad {
  label: string
  texture: WebGLTexture | null = null
  maskTexture: WebGLTexture | null = null

  static TEXTURE_SIZE = 1000

  static drawLabelToCanvas(
    label: string,
    width = 400,
    height = 120,
  ): HTMLCanvasElement {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')!
    ctx.font = '50px Helvetica'
    ctx.fillStyle = 'white'
    ctx.textBaseline = 'middle'
    ctx.fillText(label, 42, height / 2)
    return canvas
  }

  set revealMixFactor(v: number) {
    this.updateUniform('u_revealMixFactor', v)
  }

  set fadeFactor(v: number) {
    this.updateUniform('u_fadeMixFactor', v)
  }

  constructor(gl: WebGL2RenderingContext, { geometry, label }: LabelProps) {
    super(gl, {
      geometry,
      defines: {
        MESH_WIDTH: LABEL_WIDTH,
        MESH_HEIGHT: LABEL_HEIGHT,
        USE_SHADING: true,
        USE_MODEL_MATRIX: true,
        USE_UV_TRANSFORM: true,
        USE_TEXTURE: true,
        SUPPORTS_FADING: true,
        USE_MASK_TEXTURE: true,
      },
      name: label,
    })
    this.label = label

    const { width, height } = geometry
    const aspect = width / height

    const texManager = TextureAtlas.getInstance()

    promisifiedLoadImage(labelTransitionImageURL).then((transitionImage) => {
      try {
        texManager.pack(labelTransitionImageURL, transitionImage)
      } catch (err) {
        // ...
      }
      const [uvs, texture] = texManager.getUv2(labelTransitionImageURL)
      if (!uvs) {
        throw new Error('could not allocate label mask texture')
      }
      this.maskTexture = texture
      this.updateUniform(
        'u_uvOffsetSizesMask',
        new Float32Array([uvs[0], uvs[1], uvs[4], uvs[5]]),
      )
    })

    const texWidth = Label.TEXTURE_SIZE
    const texHeight = texWidth / aspect
    const atlasID = `label-${label}`
    const labelImage = Label.drawLabelToCanvas(label, texWidth, texHeight)
    texManager.pack(atlasID, labelImage)
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
    this.preRender(cameraUBOBindPoint)

    const gl = this.gl
    gl.activeTexture(gl.TEXTURE0)

    gl.bindTexture(gl.TEXTURE_2D, this.texture)

    gl.activeTexture(gl.TEXTURE1)
    gl.bindTexture(gl.TEXTURE_2D, this.maskTexture)

    gl.bindVertexArray(this.vao)
    gl.drawElements(gl.TRIANGLES, this.vertexCount, gl.UNSIGNED_SHORT, 0)
  }
}
