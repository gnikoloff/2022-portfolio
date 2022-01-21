import { vec3 } from 'gl-matrix'

import { SceneNode } from './lib/hwoa-rang-gl2'
import {
  intersectRayWithAABB,
  intersectRayWithQuad,
} from './lib/hwoa-rang-math'

import { promisifiedLoadImage } from './helpers'
import {
  CUBE_DEPTH,
  CUBE_HEIGHT,
  LABEL_MARGIN_Y,
  LABEL_MARGIN_Z,
} from './constants'

import Cube from './meshes/cube'
import Label from './meshes/label'

import { Project, ViewProps } from './interfaces'

export default class View extends SceneNode {
  visible = false
  open = false

  projectThumbNode: Cube
  projectLabelNode?: Label

  project?: Project
  externalURL?: string

  tweenAnimMode: 0 | 1 = 0 // 0 - reveal, 1 - hide animation mode

  static ROTATION_X_AXIS_ON_OPEN = Math.PI
  static ROTATION_X_AXIS_ON_CLOSE = Math.PI * 0.1
  static DEFORM_ANGLE_ON_OPEN = Math.PI * 0.5
  static DEFORM_ANGLE_ON_CLOSE = Math.PI * -0.4
  static FADED_OUT_FACTOR = 0.1
  static MESH_WRAPPER_NAME = 'mesh-wrapper'

  get sampleProgram(): WebGLProgram {
    return this.projectThumbNode.program
  }

  get children() {
    return this._children.filter(
      (child) => !child.findParentByName(View.MESH_WRAPPER_NAME),
    )
  }

  get siblings() {
    if (!this.parentNode) {
      return []
    }
    return this.parentNode.children
  }

  set fadeFactor(v: number) {
    this.projectThumbNode.fadeFactor = v
    if (this.projectLabelNode) {
      this.projectLabelNode.revealMixFactor = v
    }
  }

  set visibilityTweenFactor(v: number) {
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
    const scale = v
    const currRotationY = this.projectThumbNode.rotation[1]
    const currRotationZ = this.projectThumbNode.rotation[2]
    this.projectThumbNode
      .setScale([scale, scale, scale])
      .setRotation([rotation, currRotationY, currRotationZ])
    this.projectThumbNode.deformationAngle =
      View.DEFORM_ANGLE_ON_OPEN - deformAngle
    if (this.projectLabelNode) {
      this.projectLabelNode.revealMixFactor = v
    }
    this.updateWorldMatrix()
  }

  testRayIntersection(rayStart: vec3, rayDirection: vec3): number | null {
    if (!this.visible) {
      return null
    }

    const boxAABB = this.projectThumbNode.AABB
    let rayTime: number | null = null
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
    return rayTime
  }

  constructor(
    gl: WebGL2RenderingContext,
    {
      cubeGeometry,
      labelGeometry,
      name,
      project,
      hasLabel = false,
      externalURL,
    }: ViewProps,
  ) {
    super(name)
    this.project = project
    this.externalURL = externalURL

    const meshWrapperNode = new SceneNode(View.MESH_WRAPPER_NAME)
    meshWrapperNode.setParent(this)

    this.projectThumbNode = new Cube(gl, { geometry: cubeGeometry, name })
    this.projectThumbNode.setParent(meshWrapperNode)

    if (hasLabel) {
      this.projectLabelNode = new Label(gl, {
        geometry: labelGeometry,
        label: name,
      })
      const { height } = labelGeometry
      this.projectLabelNode.setPosition([
        0,
        -CUBE_HEIGHT / 2 - height / 2 - LABEL_MARGIN_Y,
        CUBE_DEPTH / 2 + LABEL_MARGIN_Z,
      ])
      this.projectLabelNode.setParent(meshWrapperNode)
    }
  }

  loadThumbnail = async () => {
    if (this.projectThumbNode.posterLoaded) {
      return
    }
    if (this.project?.image) {
      const image = await promisifiedLoadImage(this.project?.image.url)
      this.projectThumbNode.displayPoster(image)
      return
    }
    const canvas = document.createElement('canvas')
    canvas.width = 600
    canvas.height = 300
    const ctx = canvas.getContext('2d')!
    ctx.font = '100px Helvetica'
    ctx.fillStyle = 'white'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(this.name as string, canvas.width / 2, canvas.height / 2)
    this.projectThumbNode.displayPoster(canvas)
  }

  reveal(
    scaleX = 1,
    scaleY = 1,
    scaleZ = 1,
    rotX = 0,
    rotY = 0,
    rotZ = 0,
    deformAngle = 0,
  ) {
    this.projectThumbNode.setScale([scaleX, scaleY, scaleZ])
    this.projectThumbNode.setRotation([rotX, rotY, rotZ])
    this.projectThumbNode.deformationAngle = deformAngle
  }

  hide(
    scaleX = 0,
    scaleY = 0,
    scaleZ = 0,
    rotX = 0,
    rotY = 0,
    rotZ = 0,
    deformAngle = 0,
  ) {
    this.projectThumbNode.setScale([scaleX, scaleY, scaleZ])
    this.projectThumbNode.setRotation([rotX, rotY, rotZ])
    this.projectThumbNode.deformationAngle = deformAngle
  }

  render(): void {
    if (!this.visible) {
      return
    }
    this._children.forEach((child) => child.render())
  }
}
