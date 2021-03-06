import { vec3 } from 'gl-matrix'
import { SceneNode } from './lib/hwoa-rang-gl2'
import {
  intersectRayWithAABB,
  intersectRayWithQuad,
} from './lib/hwoa-rang-math'

import {
  CUBE_DEPTH,
  CUBE_HEIGHT,
  CUBE_WIDTH,
  FONT_STACK,
  LABEL_MARGIN_Y,
  LABEL_MARGIN_Z,
  OPEN_BUTTON_MARGIN_Y,
  OPEN_BUTTON_MARGIN_Z,
  OPEN_BUTTON_WIDTH,
} from './constants'

import { promisifiedLoadImage } from './helpers'

import Cube from './meshes/menu-box'
import Label from './meshes/label'

import { Project, ViewProps } from './interfaces'

export default class View extends SceneNode {
  gl: WebGL2RenderingContext

  projectThumbNode: Cube
  hoverThumbNode: Cube
  projectLabelNode?: Label
  projectRoleNode?: Label
  openLabelNode?: Label

  isAboutView = false
  project?: Project
  externalURL?: string

  open = false
  #visibilityTweenFactor = -1
  tweenAnimMode: 0 | 1 = 1 // 0 - reveal, 1 - hide animation mode

  static ROTATION_X_AXIS_ON_OPEN = Math.PI
  static ROTATION_X_AXIS_ON_CLOSE = Math.PI
  static DEFORM_ANGLE_ON_OPEN = Math.PI * 0.5
  static DEFORM_ANGLE_ON_CLOSE = Math.PI * 0.6
  static FADED_OUT_FACTOR = 0.2
  static HOVER_MESH_UPSCALE_FACTOR = 0.05
  static MESH_WRAPPER_NAME = 'mesh-wrapper'

  set visible(v: boolean) {
    if (!v && this.#visibilityTweenFactor !== 0) {
      this.visibilityTweenFactor = 0
      // this.setScale([0, 0, 0])
    }
    this._visible = v
    const viewWrapper = this.findChild(
      (child) => child.name === View.MESH_WRAPPER_NAME,
    )
    viewWrapper?.traverse((child) => {
      child.visible = v
    })
  }

  get children(): View[] {
    return (this._children as View[]).filter(
      (child) => !child.findParentByName(View.MESH_WRAPPER_NAME),
    )
  }

  get siblings() {
    if (!this.parentNode) {
      return []
    }
    return this.parentNode.children
  }

  get fadeFactor() {
    return this.projectThumbNode.fadeFactor
  }

  set fadeFactor(v: number) {
    this.projectThumbNode.fadeFactor = v
    if (this.projectLabelNode) {
      this.projectLabelNode.fadeFactor = v
    }
  }

  set opacityFactor(v: number) {
    this.projectThumbNode.opacityFactor = v
    if (this.projectLabelNode) {
      this.projectLabelNode.opacityFactor = v
    }
  }

  set labelRevealFactor(v: number) {
    if (this.projectLabelNode) {
      this.projectLabelNode.revealMixFactor = v
    }
  }

  set openHoverFactor(v: number) {
    if (this.openLabelNode) {
      this.openLabelNode.hoverFactor = v
    }
  }

  set metaLabelsRevealFactor(v: number) {
    if (this.projectRoleNode) {
      this.projectRoleNode.revealMixFactor = v
    }
    if (this.openLabelNode) {
      this.openLabelNode.revealMixFactor = v
    }
  }

  get visibilityTweenFactor(): number {
    return this.#visibilityTweenFactor
  }

  set visibilityTweenFactor(v: number) {
    this.#visibilityTweenFactor = v
    const startRotationAngle =
      this.tweenAnimMode === 0
        ? View.ROTATION_X_AXIS_ON_OPEN
        : View.ROTATION_X_AXIS_ON_CLOSE
    const startDeformAngle =
      this.tweenAnimMode === 0
        ? View.DEFORM_ANGLE_ON_OPEN
        : View.DEFORM_ANGLE_ON_CLOSE
    const rotation = startRotationAngle - startRotationAngle * v
    const deformAngle = startRotationAngle - startDeformAngle * v
    const scale = this.tweenAnimMode === 1 ? v : 1
    const currRotationY = this.projectThumbNode.rotation[1]
    const currRotationZ = this.projectThumbNode.rotation[2]
    this.projectThumbNode
      .setScale([scale, scale, scale])
      .setRotation([rotation, currRotationY, currRotationZ])
    this.projectThumbNode.opacityFactor = v
    this.projectThumbNode.deformationAngle =
      View.DEFORM_ANGLE_ON_OPEN - deformAngle

    const upscale = scale + View.HOVER_MESH_UPSCALE_FACTOR
    this.hoverThumbNode
      .setScale([upscale, upscale, upscale])
      .setRotation([rotation, currRotationY, currRotationZ])
    this.hoverThumbNode.opacityFactor = v
    this.hoverThumbNode.deformationAngle =
      View.DEFORM_ANGLE_ON_OPEN - deformAngle

    if (this.projectLabelNode) {
      this.projectLabelNode.revealMixFactor = v
    }
    this.updateWorldMatrix()
  }

  testRayIntersection(
    rayStart: vec3,
    rayDirection: vec3,
  ): [number | null, boolean] | null {
    if (!this._visible) {
      return null
    }

    const boxAABB = this.projectThumbNode.AABB
    let rayTime: number | null = null
    let isOpenLink = false

    const aabbIntersectionTime = intersectRayWithAABB(
      rayStart,
      rayDirection,
      boxAABB,
    )

    rayTime = aabbIntersectionTime

    if (this.projectLabelNode) {
      const quadCorners = this.projectLabelNode.cornersInWorldSpace
      const labelIntersection = intersectRayWithQuad(
        rayStart,
        rayDirection,
        quadCorners,
      )

      if (labelIntersection) {
        const [time] = labelIntersection
        rayTime = time
      }
    }

    if (this.open) {
      if (this.openLabelNode) {
        const quadCorners = this.openLabelNode.cornersInWorldSpace
        const labelIntersection = intersectRayWithQuad(
          rayStart,
          rayDirection,
          quadCorners,
        )

        if (labelIntersection) {
          const [time] = labelIntersection
          rayTime = time
          isOpenLink = true
        }
      }
    }

    if (this.open && this.project) {
      this.hoverThumbNode.visible = false
    } else {
      this.hoverThumbNode.visible = !!rayTime
    }

    return [rayTime, isOpenLink]
  }

  constructor(
    gl: WebGL2RenderingContext,
    {
      cubeGeometry,
      labelGeometry,
      openButtonGeometry,
      name,
      project,
      hasLabel = false,
      isAboutView = false,
      externalURL,
    }: ViewProps,
  ) {
    super(name)
    this.gl = gl
    this.project = project
    this.externalURL = externalURL
    this.isAboutView = isAboutView

    const meshWrapperNode = new SceneNode(View.MESH_WRAPPER_NAME)
    meshWrapperNode.setParent(this)

    this.projectThumbNode = new Cube(gl, {
      geometry: cubeGeometry,
      name,
    })
      .setScale([0, 0, 0])
      .setParent(meshWrapperNode)

    this.hoverThumbNode = new Cube(gl, {
      geometry: cubeGeometry,
      solidColor: [0, 0, 1, 1],
      side: gl.FRONT,
    })
    this.hoverThumbNode.visible = false
    const hoverScale = 1 + View.HOVER_MESH_UPSCALE_FACTOR
    this.hoverThumbNode
      .setScale([hoverScale, hoverScale, hoverScale])
      .setParent(meshWrapperNode)

    if (hasLabel) {
      this.projectLabelNode = new Label(gl, {
        geometry: labelGeometry,
        label: name,
        // texWidth: 400,
        fontSize: 50,
        transparent: true,
      })
      this.projectLabelNode.visible = false
      this.projectLabelNode.setParent(meshWrapperNode)
      this.projectLabelNode.setPosition([
        0,
        -CUBE_HEIGHT / 2 - labelGeometry.height / 2 - LABEL_MARGIN_Y,
        CUBE_DEPTH / 2 + LABEL_MARGIN_Z,
      ])
    }

    if (project) {
      this.projectRoleNode = new Label(gl, {
        geometry: labelGeometry,
        label: project.tech || '',
        // texWidth: 400,
        fontSize: 50,
        textColor: '#bbb',
        transparent: true,
      })
      this.projectRoleNode.visible = false
      this.projectRoleNode.setPosition([
        0,
        CUBE_HEIGHT / 2 + labelGeometry.height / 2 + LABEL_MARGIN_Y,
        CUBE_DEPTH / 2 + LABEL_MARGIN_Z,
      ])
      this.projectRoleNode.revealMixFactor = 0
      this.projectRoleNode.setParent(meshWrapperNode)

      this.openLabelNode = new Label(gl, {
        geometry: openButtonGeometry,
        supportHover: true,
        transparent: true,
        label: 'OPEN',
        texWidth: 120,
        fontSize: 30,
        textAlign: 'center',
        textColor: '#aaa',
      })
      this.openLabelNode.visible = false
      this.openLabelNode.revealMixFactor = 0

      this.openLabelNode.setPosition([
        CUBE_WIDTH / 2 - OPEN_BUTTON_WIDTH / 2 - 0.1,
        -CUBE_HEIGHT / 2 -
          openButtonGeometry.height / 2 -
          OPEN_BUTTON_MARGIN_Y -
          0.2,
        CUBE_DEPTH / 2 + OPEN_BUTTON_MARGIN_Z + 0.1,
      ])
      this.openLabelNode.setParent(meshWrapperNode)
    }
  }

  loadThumbnail = async (
    customThumb?: HTMLCanvasElement | HTMLImageElement,
  ) => {
    if (this.projectThumbNode.posterLoaded) {
      return
    }
    if (customThumb) {
      this.projectThumbNode.displayPoster(customThumb)
      return
    }
    if (this.project?.image) {
      const image = await promisifiedLoadImage(this.project?.image.url)
      this.projectThumbNode.displayPoster(image, true)
      return
    }
    const canvas = document.createElement('canvas')
    canvas.width = 600
    canvas.height = 300
    const ctx = canvas.getContext('2d')!
    ctx.font = `100px ${FONT_STACK}`
    ctx.fillStyle = 'white'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(this.name as string, canvas.width / 2, canvas.height / 2)
    this.projectThumbNode.displayPoster(canvas)
  }

  render(): void {
    if (!this._visible) {
      return
    }
    for (let i = 0; i < this._children.length; i++) {
      const child = this._children[i]
      child.render()
    }
  }
}
