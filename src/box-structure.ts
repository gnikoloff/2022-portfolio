import { mat4, vec3 } from 'gl-matrix'
import PerspectiveCamera from './cameras/perspective-camera'
import OrthographicCamera from './cameras/orthographic-camera'
import Renderable from './core/renderable'
import { createRoundedBox } from './helpers/create-round-box'
import { BoundingBox, Project } from './types'
import store from './store'
import { loadImage } from './helpers/helpers'
import TextureManager from './texture-manager'
import View from './view'

export default class BoxStructure extends Renderable {
  #instanceMatrixBuffer: WebGLBuffer
  #instanceMatrixArray: Float32Array
  #instanceUvOffsetsBuffer: WebGLBuffer

  texture!: WebGLTexture

  vertexCount: number
  instanceCount: number
  boundingBox: BoundingBox
  views: Map<number, View> = new Map()
  // projects: Project[] = []

  constructor(gl: WebGL2RenderingContext, projects: Project[]) {
    super(gl, {
      USE_INSTANCING: true,
      USE_SHADING: true,
      USE_UV_TRANSFORM: true,
      USE_TEXTURE: true,
      USE_BACKGROUND_SIZE_COVER: true,
      IS_CUBE: true,
      // ANIMATE_IN_PLACE: false,
    })
    // this.projects = projects
    this.instanceCount = projects.length

    const {
      ui: { boxSize },
    } = store.getState()
    const boxWidth = boxSize[0]
    const boxHeight = boxSize[1]
    const boxDepth = boxSize[2]
    const boxRadius = 0.1

    this.boundingBox = {
      min: vec3.fromValues(-boxWidth / 2, -boxHeight / 2, -boxDepth / 2),
      max: vec3.fromValues(boxWidth / 2, boxHeight / 2, boxDepth / 2),
    }
    const { vertexDivisor, verticesNormalUvs, indices } = createRoundedBox({
      width: boxWidth,
      height: boxHeight,
      depth: boxDepth,
      radius: boxRadius,
    })

    this.vertexCount = indices.length

    this.#instanceMatrixBuffer = gl.createBuffer()!
    this.#instanceUvOffsetsBuffer = gl.createBuffer()!
    const cubeInterleavedDataBuffer = gl.createBuffer()
    const indexBuffer = gl.createBuffer()

    const aPositionLoc = gl.getAttribLocation(this.drawProgram, 'aPosition')
    const aNormalLoc = gl.getAttribLocation(this.drawProgram, 'aNormal')
    const aUvLoc = gl.getAttribLocation(this.drawProgram, 'aUv')
    const aInstanceUvOffsetsLoc = gl.getAttribLocation(
      this.drawProgram,
      'aInstanceUvOffsets',
    )
    const aImageSizeLoc = gl.getAttribLocation(this.drawProgram, 'aImageSize')
    const aInstanceMatrixLoc = gl.getAttribLocation(
      this.drawProgram,
      'aInstanceMatrix',
    )

    const diffuseTexLocation = gl.getUniformLocation(
      this.drawProgram,
      'diffuse',
    )

    gl.useProgram(this.drawProgram)
    gl.uniform1i(diffuseTexLocation, 0)
    gl.useProgram(null)

    gl.bindVertexArray(this.vao)
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeInterleavedDataBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, verticesNormalUvs, gl.STATIC_DRAW)

    gl.enableVertexAttribArray(aPositionLoc)
    gl.vertexAttribPointer(
      aPositionLoc,
      3,
      gl.FLOAT,
      false,
      vertexDivisor * Float32Array.BYTES_PER_ELEMENT,
      0,
    )

    gl.enableVertexAttribArray(aNormalLoc)
    gl.vertexAttribPointer(
      aNormalLoc,
      3,
      gl.FLOAT,
      false,
      vertexDivisor * Float32Array.BYTES_PER_ELEMENT,
      3 * Float32Array.BYTES_PER_ELEMENT,
    )

    gl.enableVertexAttribArray(aUvLoc)
    gl.vertexAttribPointer(
      aUvLoc,
      2,
      gl.FLOAT,
      false,
      vertexDivisor * Float32Array.BYTES_PER_ELEMENT,
      6 * Float32Array.BYTES_PER_ELEMENT,
    )

    this.#instanceMatrixArray = new Float32Array(this.instanceCount * 16)
    gl.bindBuffer(gl.ARRAY_BUFFER, this.#instanceMatrixBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, this.#instanceMatrixArray, gl.DYNAMIC_DRAW)
    const bytesPerMatrix = 16 * Float32Array.BYTES_PER_ELEMENT
    for (let i = 0; i < 4; i++) {
      const loc = aInstanceMatrixLoc + i
      gl.enableVertexAttribArray(loc)
      gl.vertexAttribPointer(loc, 4, gl.FLOAT, false, bytesPerMatrix, i * 16)
      gl.vertexAttribDivisor(loc, 1)
    }

    const instanceUvOffsets = new Float32Array(this.instanceCount * 6)
    gl.bindBuffer(gl.ARRAY_BUFFER, this.#instanceUvOffsetsBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, instanceUvOffsets, gl.DYNAMIC_DRAW)

    gl.enableVertexAttribArray(aInstanceUvOffsetsLoc)
    gl.vertexAttribPointer(
      aInstanceUvOffsetsLoc,
      4,
      gl.FLOAT,
      false,
      6 * Float32Array.BYTES_PER_ELEMENT,
      0,
    )
    gl.vertexAttribDivisor(aInstanceUvOffsetsLoc, 1)

    gl.enableVertexAttribArray(aImageSizeLoc)
    gl.vertexAttribPointer(
      aImageSizeLoc,
      2,
      gl.FLOAT,
      false,
      6 * Float32Array.BYTES_PER_ELEMENT,
      4 * Float32Array.BYTES_PER_ELEMENT,
    )
    gl.vertexAttribDivisor(aImageSizeLoc, 1)

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW)

    gl.bindVertexArray(null)
  }

  getBoxInstanceAABB(position: vec3): BoundingBox {
    const min = vec3.create()
    const max = vec3.create()
    vec3.add(min, position, this.boundingBox.min)
    vec3.add(max, position, this.boundingBox.max)
    return { min, max }
  }

  setBoxView = async (boxIdx: number, view: View): Promise<null> => {
    this.views.set(boxIdx, view)
    if (
      view.uid === 'projects' ||
      view.uid === 'about' ||
      view.uid === '2014' ||
      view.uid === '2015' ||
      view.uid === '2016' ||
      view.uid === '2017' ||
      view.uid === '2018' ||
      view.uid === '2019' ||
      view.uid === '2020' ||
      view.uid === '2021'
    ) {
      return Promise.resolve(null)
    }
    const {
      projects: { projects },
    } = store.getState()
    const project = projects.find(({ uid }) => uid === view.uid)

    // const projectImage = this.projectImages.get(view.uid)
    const textureManager = TextureManager.instance
    let [uvs, texture] = textureManager.getUv2(view.uid)
    let image: HTMLImageElement
    if (!uvs) {
      image = await loadImage(project.image.url)
      textureManager.pack(view.uid, image)
      const [newUvs, newTexture] = textureManager.getUv2(view.uid)
      uvs = newUvs
      texture = newTexture
    }
    this.texture = texture
    const uvToPass = new Float32Array([
      uvs[0],
      uvs[1],
      uvs[4],
      uvs[5],
      image.naturalWidth,
      image.naturalHeight,
    ])
    // console.log({ uvToPass })

    const gl = this.gl
    gl.bindVertexArray(this.vao)
    gl.bindBuffer(gl.ARRAY_BUFFER, this.#instanceUvOffsetsBuffer)

    gl.bufferSubData(
      gl.ARRAY_BUFFER,
      boxIdx * 6 * Float32Array.BYTES_PER_ELEMENT,
      uvToPass,
    )
    gl.bindVertexArray(null)
  }

  setTransformMatrix(boxIdx: number, matrix: mat4): this {
    this.#instanceMatrixArray.set(matrix, boxIdx * 16)
    return this
  }

  uploadBoxPositionsGPU(boxIdxStart: number, boxIdxEnd: number): this {
    const gl = this.gl
    const matrixSize = 16
    const subArray = this.#instanceMatrixArray.slice(
      boxIdxStart * matrixSize,
      boxIdxEnd * matrixSize,
    )
    gl.bindVertexArray(this.vao)
    gl.bindBuffer(this.gl.ARRAY_BUFFER, this.#instanceMatrixBuffer)
    this.gl.bufferSubData(
      this.gl.ARRAY_BUFFER,
      boxIdxStart * matrixSize * Float32Array.BYTES_PER_ELEMENT,
      subArray,
    )
    gl.bindVertexArray(null)
    return this
  }

  render(
    camera: PerspectiveCamera | OrthographicCamera,
    ts: DOMHighResTimeStamp,
  ): void {
    const gl = this.gl
    gl.useProgram(this.drawProgram)
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, this.texture)
    gl.uniformMatrix4fv(
      this.viewProjectionMatrixLocation,
      false,
      camera.projectionViewMatrix,
    )
    gl.uniform1f(this.timeLocation, ts)
    gl.bindVertexArray(this.vao)
    gl.drawElementsInstanced(
      gl.TRIANGLES,
      this.vertexCount,
      gl.UNSIGNED_SHORT,
      0,
      this.instanceCount,
    )
  }
}
