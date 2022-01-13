import { vec2 } from 'gl-matrix'
import { Atlas } from 'texture-atlas'

let textureSize: vec2 = [2048, 2048]
let instance: TextureManager
let gl: WebGL2RenderingContext

let debugMode = false

export default class TextureManager {
  #atlases: Atlas[] = []
  #textures: WebGLTexture[] = []

  #debugDomContainer = document.createElement('div')

  static set debugMode(newDebugMode: boolean) {
    debugMode = newDebugMode
  }

  static set textureSize(newTexSize: vec2) {
    textureSize = newTexSize
  }

  static set gl(glContext: WebGL2RenderingContext) {
    gl = glContext
  }

  static get instance(): TextureManager {
    if (!textureSize) {
      throw new Error(
        'You must set up a textureSize first via TextureManager.setSize()!',
      )
    }
    if (!gl) {
      throw new Error(
        'You must provide a WebGL2RenderingContext first via TextureManager.setGL()!',
      )
    }
    if (!instance) {
      instance = new TextureManager()
    }
    return instance
  }

  static scaleDownDrawableByFactor = (
    drawable: HTMLCanvasElement | HTMLImageElement,
    downscaleFactor: number,
  ) => {
    const canvas = document.createElement('canvas')
    const drawableWidth =
      drawable instanceof HTMLImageElement
        ? drawable.naturalWidth
        : drawable.width
    const drawableHeight =
      drawable instanceof HTMLImageElement
        ? drawable.naturalHeight
        : drawable.height

    canvas.width = drawableWidth / downscaleFactor
    canvas.height = drawableHeight / downscaleFactor

    if (debugMode) {
      console.log(
        `Scaled ${drawableWidth}x${drawableHeight} project image to ${canvas.width}x${canvas.height}`,
      )
    }

    const ctx = canvas.getContext('2d')!
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(
      drawable,
      0,
      0,
      drawableWidth,
      drawableHeight,
      0,
      0,
      canvas.width,
      canvas.height,
    )
    return canvas
  }

  constructor() {
    this.#debugDomContainer.setAttribute(
      'style',
      `
      position: fixed;
      bottom: 1rem;
      right: 1rem;
      transform-origin: 100% 100%;
      transform: scale(0.15);
      border: 20px solid red;
    `,
    )
    if (debugMode) {
      // document.body.appendChild(this.#debugDomContainer)
    }
  }

  pack(
    id: string,
    drawable: HTMLCanvasElement | HTMLImageElement,
    downscaleFactor = 1,
  ): this {
    const allocateNewAtlas = () => {
      const canvas = document.createElement('canvas')
      this.#debugDomContainer.appendChild(canvas)
      canvas.width = textureSize[0]
      canvas.height = textureSize[1]
      const texture = gl.createTexture()!

      // upload empty texture now, fill subregions with texSubImage2D later
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texParameterf(
        gl.TEXTURE_2D,
        gl.TEXTURE_MIN_FILTER,
        gl.LINEAR_MIPMAP_LINEAR,
      )
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGB,
        textureSize[0],
        textureSize[1],
        0,
        gl.RGB,
        gl.UNSIGNED_BYTE,
        null,
      )
      gl.generateMipmap(gl.TEXTURE_2D)
      gl.bindTexture(gl.TEXTURE_2D, null)

      const atlas = new Atlas(canvas)
      this.#atlases.push(atlas)
      this.#textures.push(texture)
      return atlas
    }

    let atlas = this.#atlases[this.#atlases.length - 1]
    if (!atlas) {
      atlas = allocateNewAtlas()
    }

    const drawableToPack =
      downscaleFactor === 1
        ? drawable
        : TextureManager.scaleDownDrawableByFactor(drawable, downscaleFactor)

    const success = atlas.pack(id, drawableToPack)
    if (!success) {
      atlas = allocateNewAtlas()
      atlas.pack(id, drawableToPack)
    }

    const uv = atlas.uv()[id]
    for (let i = 0; i < uv.length; i++) {
      uv[i][0] *= textureSize[0]
      uv[i][1] *= textureSize[1]
    }

    // upload drawable graphic to correct texture and correct subregion on GPU
    const texture = this.#textures[this.#textures.length - 1]
    const xOffset = uv[0][0]
    const yOffset = uv[0][1]
    const regionWidth = uv[2][0] - uv[0][0]
    const regionHeight = uv[2][1] - uv[0][1]

    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texSubImage2D(
      gl.TEXTURE_2D,
      0,
      xOffset,
      yOffset,
      regionWidth,
      regionHeight,
      gl.RGB,
      gl.UNSIGNED_BYTE,
      drawableToPack,
    )
    gl.generateMipmap(gl.TEXTURE_2D)
    gl.bindTexture(gl.TEXTURE_2D, null)

    return this
  }

  getUv2(id: string): [Float32Array | null, WebGLTexture] {
    let uvs: Float32Array
    let texIdx = -1
    for (let i = 0; i < this.#atlases.length; i++) {
      const atlas = this.#atlases[i]
      const subRegionUvs = atlas.uv2()[id]
      if (subRegionUvs) {
        texIdx = i
        uvs = subRegionUvs
        break
      }
    }
    const texture = this.#textures[texIdx]
    return [uvs, texture]
  }
}
