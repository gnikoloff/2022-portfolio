import { vec3 } from 'gl-matrix'
import {
  intersectRayWithAABB,
  intersectRayWithQuad,
  SceneNode,
} from '../lib/hwoa-rang-gl2/dist'
import Cube from '../meshes/cube'
import { Project, ViewProps } from '../interfaces'
import Label from '../meshes/label'
import { promisifiedLoadImage } from '../helpers'
import {
  CUBE_DEPTH,
  CUBE_HEIGHT,
  LABEL_MARGIN_Y,
  LABEL_MARGIN_Z,
} from '../constants'

export default class View extends SceneNode {
  visible = false
  open = true

  projectThumbNode: Cube
  projectLabelNode?: Label

  project?: Project

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
      this.projectLabelNode.fadeFactor = v
    }
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
    { cubeGeometry, labelGeometry, name, project, hasLabel = false }: ViewProps,
  ) {
    super(name)
    this.project = project

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
