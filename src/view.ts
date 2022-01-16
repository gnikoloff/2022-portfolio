import { vec3 } from 'gl-matrix'
import { BoundingBox, SceneNode } from './lib/hwoa-rang-gl2/dist'
import RoundCube from './meshes/round-cube'
import { Project, ViewProps } from './interfaces'
import Label from './meshes/label'

export default class View extends SceneNode {
  visible = false
  open = true

  projectThumbNode: RoundCube
  projectLabelNode: Label
  project?: Project

  get AABB(): BoundingBox {
    return this.projectThumbNode.AABB
  }

  get labelQuadVertPositions(): [vec3, vec3, vec3, vec3] {
    return this.projectLabelNode.cornersInWorldSpace
  }

  get sampleProgram(): WebGLProgram {
    return this.projectThumbNode.program
  }

  constructor(
    gl: WebGL2RenderingContext,
    { cubeGeometry, labelGeometry, name, project }: ViewProps,
  ) {
    super(name)
    this.project = project

    const meshWrapperNode = new SceneNode('mesh-wrapper')
    meshWrapperNode.setParent(this)

    this.projectThumbNode = new RoundCube(gl, { geometry: cubeGeometry })
    this.projectThumbNode.setParent(meshWrapperNode)

    this.projectLabelNode = new Label(gl, {
      geometry: labelGeometry,
      label: 'hello',
    })
    this.projectLabelNode.setPosition([0, 1, 0])
    this.projectLabelNode.setParent(meshWrapperNode)
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

  render(timeMS: DOMHighResTimeStamp): void {
    if (!this.visible) {
      return
    }
    this.children.forEach((child) => child.render(timeMS))
  }
}
