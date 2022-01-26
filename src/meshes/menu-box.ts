import { vec3 } from 'gl-matrix'

import { Drawable, TextureAtlas } from '../lib/hwoa-rang-gl2'
import { BoundingBox } from '../lib/hwoa-rang-math'
import { Tween } from '../lib/hwoa-rang-anim'

import { CubeProps } from '../interfaces'

import VERTEX_SHADER_SRC from '../shaders/uberShader.vert'
import FRAGMENT_SHADER_SRC from '../shaders/uberShader.frag'
import { TRANSITION_LOAD_IMAGE_DURATION } from '../constants'

export default class MenuBox extends Drawable {
  cameraUBOIndex: GLuint
  textureAtlas!: WebGLTexture
  side: GLenum

  isSolidColor = false
  posterLoaded = false
  visible = true

  #fadeFactor = 0

  get AABB(): BoundingBox {
    const min = vec3.clone(this.boundingBox.min)
    const max = vec3.clone(this.boundingBox.max)
    vec3.transformMat4(min, min, this.worldMatrix)
    vec3.transformMat4(max, max, this.worldMatrix)
    return { min, max }
  }

  set deformationAngle(v: number) {
    this.updateUniform('u_deformAngle', v)
  }

  get fadeFactor() {
    return this.#fadeFactor
  }

  set fadeFactor(v: number) {
    this.updateUniform('u_fadeMixFactor', v)
    this.#fadeFactor = v
  }

  constructor(
    gl: WebGL2RenderingContext,
    { geometry, solidColor, name, side = gl.BACK }: CubeProps,
  ) {
    const defines = {
      USE_SHADING: true,
      USE_SOLID_COLOR: !!solidColor,
      USE_SPIRAL_DEFORM: true,
      USE_TEXTURE: !solidColor,
      USE_UV_TRANSFORM: true,
      USE_BACKGROUND_SIZE_COVER: true,
      MESH_WIDTH: geometry.width,
      MESH_HEIGHT: geometry.height,
      IS_CUBE: true,
      SUPPORTS_FADING: true,
    }
    super(gl, VERTEX_SHADER_SRC, FRAGMENT_SHADER_SRC, defines)

    this.isSolidColor = !!solidColor

    this.name = name
    this.side = side

    const {
      interleavedArray,
      indicesArray,
      width,
      height,
      depth,
      vertexStride,
      vertexCount,
    } = geometry

    this.vertexCount = vertexCount

    this.boundingBox = {
      min: vec3.fromValues(-width / 2, -height / 2, -depth / 2),
      max: vec3.fromValues(width / 2, height / 2, depth / 2),
    }

    this.setUniform('u_deformAngle', {
      type: gl.FLOAT,
    })
    this.setUniform('u_fadeMixFactor', {
      type: gl.FLOAT,
      value: 1,
    })
    this.setUniform('u_uvOffsetSizes', {
      type: gl.FLOAT_VEC4,
    })
    this.setUniform('u_textureSize', {
      type: gl.FLOAT_VEC2,
    })

    if (!this.isSolidColor) {
      this.setUniform('u_diffuse', {
        type: gl.INT,
        value: 0,
      })

      this.setUniform('u_loadMixFactor', {
        type: gl.FLOAT,
        value: 0,
      })
    }

    const interleavedBuffer = gl.createBuffer()
    const indexBuffer = gl.createBuffer()

    const aPositionLoc = gl.getAttribLocation(this.program, 'aPosition')
    const aNormalLoc = gl.getAttribLocation(this.program, 'aNormal')
    const aUvLoc = gl.getAttribLocation(this.program, 'aUv')

    if (this.isSolidColor) {
      this.setUniform('u_solidColor', {
        type: gl.FLOAT_VEC4,
        value: solidColor as Float32Array,
      })
    }

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
    // normal
    gl.enableVertexAttribArray(aNormalLoc)
    gl.vertexAttribPointer(
      aNormalLoc,
      3,
      gl.FLOAT,
      false,
      vertexStride * Float32Array.BYTES_PER_ELEMENT,
      3 * Float32Array.BYTES_PER_ELEMENT,
    )
    // uv
    gl.enableVertexAttribArray(aUvLoc)
    gl.vertexAttribPointer(
      aUvLoc,
      2,
      gl.FLOAT,
      false,
      vertexStride * Float32Array.BYTES_PER_ELEMENT,
      6 * Float32Array.BYTES_PER_ELEMENT,
    )

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indicesArray, gl.STATIC_DRAW)

    this.cameraUBOIndex = gl.getUniformBlockIndex(this.program, 'Camera')
  }

  displayPoster(
    poster: HTMLImageElement | HTMLCanvasElement,
    tweenFadeIn = false,
  ) {
    if (!this.name) {
      throw new Error('you need to supply a name in order to display a poster')
    }
    const texManager = TextureAtlas.getInstance()
    texManager.pack(this.name, poster)
    const [uvs, texture] = texManager.getUv2(this.name)
    if (!uvs) {
      throw new Error('mega texture allocation failed')
    }
    this.textureAtlas = texture

    this.updateUniform(
      'u_uvOffsetSizes',
      new Float32Array([uvs[0], uvs[1], uvs[4], uvs[5]]),
    )
    this.updateUniform(
      'u_textureSize',
      new Float32Array([poster.width, poster.height]),
    )

    if (!this.isSolidColor) {
      if (tweenFadeIn) {
        new Tween({
          durationMS: TRANSITION_LOAD_IMAGE_DURATION,
          onUpdate: (v) => {
            this.updateUniform('u_loadMixFactor', v)
          },
        }).start()
      } else {
        this.updateUniform('u_loadMixFactor', 1)
      }
    }

    this.posterLoaded = true
  }

  render(): void {
    if (!this.visible) {
      return
    }
    const gl = this.gl
    gl.uniformBlockBinding(this.program, this.cameraUBOIndex, 0)
    gl.useProgram(this.program)
    this.uploadWorldMatrix()

    if (this.side !== gl.BACK) {
      gl.enable(gl.CULL_FACE)
      gl.cullFace(this.side)
    }

    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    gl.enable(gl.BLEND)

    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, this.textureAtlas)

    gl.bindVertexArray(this.vao)
    gl.drawElements(gl.TRIANGLES, this.vertexCount, gl.UNSIGNED_SHORT, 0)

    if (this.side !== gl.BACK) {
      gl.disable(gl.CULL_FACE)
    }

    gl.disable(gl.BLEND)
    // gl.enable(gl.DEPTH_TEST)
  }
}
