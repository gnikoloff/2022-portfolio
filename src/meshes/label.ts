import { vec3 } from 'gl-matrix'
import { LabelProps } from '../interfaces'
import { Drawable, MegaTexture } from '../lib/hwoa-rang-gl2/dist'

import VERTEX_SHADER_SRC from '../shaders/uberShader.vert'
import FRAGMENT_SHADER_SRC from '../shaders/uberShader.frag'

export default class Label extends Drawable {
  cameraUBOIndex: GLuint
  label: string
  textureAtlas: WebGLTexture | null = null

  #worldSpaceVertPositions!: [vec3, vec3, vec3, vec3]

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

  get cornersInWorldSpace(): [vec3, vec3, vec3, vec3] {
    if (this.#worldSpaceVertPositions && !this.shouldUpdate) {
      return this.#worldSpaceVertPositions
    }
    const labelWidth = this.boundingBox.max[0] - this.boundingBox.min[0]
    const labelHeight = this.boundingBox.max[1] - this.boundingBox.min[1]
    const pos0 = vec3.fromValues(-labelWidth / 2, labelHeight / 2, 0)
    const pos1 = vec3.fromValues(-labelWidth / 2, -labelHeight / 2, 0)
    const pos2 = vec3.fromValues(labelWidth / 2, -labelHeight / 2, 0)
    const pos3 = vec3.fromValues(labelWidth / 2, labelHeight / 2, 0)
    vec3.transformMat4(pos0, pos0, this.worldMatrix)
    vec3.transformMat4(pos1, pos1, this.worldMatrix)
    vec3.transformMat4(pos2, pos2, this.worldMatrix)
    vec3.transformMat4(pos3, pos3, this.worldMatrix)
    this.#worldSpaceVertPositions = [pos0, pos1, pos2, pos3]

    return this.#worldSpaceVertPositions
  }

  constructor(gl: WebGL2RenderingContext, { geometry, label }: LabelProps) {
    super(gl, VERTEX_SHADER_SRC, FRAGMENT_SHADER_SRC, {
      USE_SHADING: true,
      USE_MODEL_MATRIX: true,
      USE_UV_TRANSFORM: true,
      USE_TEXTURE: true,
    })
    this.label = label

    const {
      interleavedArray,
      indicesArray,
      vertexStride,
      vertexCount,
      width,
      height,
    } = geometry

    this.vertexCount = vertexCount

    this.boundingBox = {
      min: [-width / 2, height / 2, 0],
      max: [width / 2, -height / 2, 0],
    }

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

    const uvOffsetLocation = gl.getUniformLocation(
      this.program,
      'u_uvOffsetSizes',
    )!
    const uTextureSize = gl.getUniformLocation(this.program, 'u_textureSize')!

    const textureAtlasLocation = gl.getUniformLocation(
      this.program,
      'u_textureAtlas',
    )!

    gl.useProgram(this.program)
    gl.uniform4f(uvOffsetLocation, uvs[0], uvs[1], uvs[4], uvs[5])
    gl.uniform2f(uTextureSize, labelImage.width, labelImage.height)
    gl.uniform1i(textureAtlasLocation, 0)

    const interleavedBuffer = gl.createBuffer()
    const indexBuffer = gl.createBuffer()

    const aPositionLoc = gl.getAttribLocation(this.program, 'aPosition')
    const aUvLoc = gl.getAttribLocation(this.program, 'aUv')

    gl.bindVertexArray(this.vao)
    gl.bindBuffer(gl.ARRAY_BUFFER, interleavedBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, interleavedArray, gl.STATIC_DRAW)

    // pos
    gl.enableVertexAttribArray(aPositionLoc)
    gl.vertexAttribPointer(
      aPositionLoc,
      3,
      gl.FLOAT,
      false,
      vertexStride * Float32Array.BYTES_PER_ELEMENT,
      0,
    )

    // uv
    gl.enableVertexAttribArray(aUvLoc)
    gl.vertexAttribPointer(
      aUvLoc,
      2,
      gl.FLOAT,
      false,
      vertexStride * Float32Array.BYTES_PER_ELEMENT,
      3 * Float32Array.BYTES_PER_ELEMENT,
    )

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indicesArray, gl.STATIC_DRAW)

    this.cameraUBOIndex = gl.getUniformBlockIndex(this.program, 'Camera')
  }

  render(timeMS: DOMHighResTimeStamp): void {
    const gl = this.gl
    gl.uniformBlockBinding(this.program, this.cameraUBOIndex, 0)
    gl.useProgram(this.program)
    this.uploadWorldMatrix()

    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, this.textureAtlas)

    gl.bindVertexArray(this.vao)
    gl.drawElements(gl.TRIANGLES, this.vertexCount, gl.UNSIGNED_SHORT, 0)
  }
}
