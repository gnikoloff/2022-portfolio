import { Project } from './interfaces'
import store from './store'

import Line from './meshes/line'

import './style.css'

import {
  getXYZForViewIdxWithinLevel,
  sortProjectEntriesByYear,
  transformProjectEntries,
} from './helpers'

import {
  setIsCurrentlyTransitionViews,
  setIsHovering,
  setMousePos,
  setShowCubeHighlight,
} from './store/ui'
import View from './view'

import {
  CameraController,
  createPlane,
  createRoundedBox,
  OrthographicCamera,
  PerspectiveCamera,
  SceneNode,
  deg2Rad,
  intersectRayWithAABB,
  projectMouseToWorldSpace,
  createAndBindUBOToBase,
  createUniformBlockInfo,
  UBOInfo,
  intersectRayWithQuad,
  MegaTexture,
} from './lib/hwoa-rang-gl2/dist'

import { Tween } from './lib/hwoa-rang-anim/dist'

import RoundCube from './meshes/round-cube'

import { vec3 } from 'gl-matrix'
import { CUBE_DEPTH, CUBE_HEIGHT, CUBE_WIDTH } from './constants'

let prevView!: View

const debugLines: Line[] = []

const rootNode = new SceneNode()
const boxesRootNode = new SceneNode()
boxesRootNode.setParent(rootNode)

const $app = document.getElementById('app')!

const $canvas: HTMLCanvasElement = document.createElement('canvas')
$canvas.width = innerWidth * devicePixelRatio
$canvas.height = innerHeight * devicePixelRatio
$canvas.style.setProperty('width', `${innerWidth}px`)
$canvas.style.setProperty('height', `${innerHeight}px`)
$app.appendChild($canvas)

const gl: WebGL2RenderingContext = $canvas.getContext('webgl2')!

let uboCamera: WebGLBuffer
let uboCameraBlockInfo: UBOInfo

// MegaTexture.debugMode = true
MegaTexture.gl = gl
const texManager = MegaTexture.getInstance()

console.log(texManager)

const perspectiveCamera = new PerspectiveCamera(
  deg2Rad(70),
  $canvas.width / $canvas.height,
  0.1,
  20,
)
perspectiveCamera.position = [0, 2, 8]
perspectiveCamera.lookAt = [0, 0, 0]

new CameraController(perspectiveCamera)

const orthographicCamera = new OrthographicCamera(
  -innerWidth / 2,
  innerWidth / 2,
  innerHeight / 2,
  -innerHeight / 2,
  0.1,
  20,
)
orthographicCamera.position = [0, 0, 1]
orthographicCamera.lookAt = [0, 0, 0]

orthographicCamera.updateViewMatrix().updateProjectionViewMatrix()

const { verticesNormalUv, indices } = createPlane({
  width: innerWidth,
  height: innerHeight,
})

fetch('http://localhost:3001/api')
  .then((projects) => projects.json())
  .then(transformProjectEntries)
  .then((projects: Project[]) => {
    const viewGeoPartialProps = { cubeGeometry, labelGeometry }
    const projectsByYear = sortProjectEntriesByYear(projects)

    const projectsNode = new View(gl, {
      ...viewGeoPartialProps,
      name: 'projects',
    })

    const drawProgramToGetUBOFrom = projectsNode.sampleProgram
    uboCameraBlockInfo = createUniformBlockInfo(
      gl,
      drawProgramToGetUBOFrom,
      'Camera',
      ['projectionViewMatrix'],
    )
    uboCamera = createAndBindUBOToBase(gl, uboCameraBlockInfo.blockSize, 0)!

    projectsNode.setPosition(getXYZForViewIdxWithinLevel(1, 0))
    projectsNode.loadThumbnail()
    projectsNode.reveal()
    projectsNode.visible = true
    projectsNode.setParent(boxesRootNode)

    const aboutNode = new View(gl, { ...viewGeoPartialProps, name: 'about' })
    aboutNode.loadThumbnail()
    aboutNode.reveal()
    aboutNode.visible = true
    aboutNode.setParent(boxesRootNode)

    const aaaaaaNode = new View(gl, { ...viewGeoPartialProps, name: 'aa' })
    aaaaaaNode.loadThumbnail()
    aaaaaaNode.reveal()
    aaaaaaNode.visible = false
    aaaaaaNode.setParent(aboutNode)

    const contactNode = new View(gl, {
      ...viewGeoPartialProps,
      name: 'contact',
    })
    contactNode.loadThumbnail()
    contactNode.reveal()
    contactNode.visible = true
    contactNode.setParent(boxesRootNode)

    const blogNode = new View(gl, {
      ...viewGeoPartialProps,
      name: 'blog',
    })
    blogNode.loadThumbnail()
    blogNode.reveal()
    blogNode.visible = true
    blogNode.setParent(boxesRootNode)

    for (const [key, projects] of Object.entries(projectsByYear)) {
      const yearNode = new View(gl, { ...viewGeoPartialProps, name: key })
      yearNode.setParent(projectsNode)
      for (let i = 0; i < projects.length; i++) {
        const project = projects[i]
        const projectNode = new View(gl, {
          ...viewGeoPartialProps,
          name: project.uid,
          project,
          hasLabel: true,
        })
        projectNode.setParent(yearNode)
      }
    }

    const positionNodeWithinLevel = (
      node: SceneNode,
      idx: number,
      levelIdx: number,
    ) => {
      const position = getXYZForViewIdxWithinLevel(idx, levelIdx)
      node.setPosition(position).updateWorldMatrix()
      levelIdx++
      const children = node.children
      for (let i = 0; i < children.length; i++) {
        const child = node.children[i] as View
        positionNodeWithinLevel(child, i, levelIdx)
      }
    }

    positionNodeWithinLevel(boxesRootNode, 0, -1)

    // projectsNode.iterateChildren((childNode, i) => {
    //   const position = getXYZForViewIdxWithinLevel(i, 1)
    //   childNode.setPosition(position)
    //   childNode.iterateChildren((projectNode, n) => {
    //     const position = getXYZForViewIdxWithinLevel(n, 2)
    //     projectNode.setPosition(position)
    //   })
    // })

    // console.log(boxesRootNode)

    // boxesRootNode.updateWorldMatrix()
  })

const cubeGeometry = createRoundedBox({
  width: CUBE_WIDTH,
  height: CUBE_HEIGHT,
  depth: CUBE_DEPTH,
  radius: 0.75,
  div: 10,
})
const labelGeometry = createPlane({
  width: 2,
  height: 0.2,
})

const hoverCube = new RoundCube(gl, {
  geometry: cubeGeometry,
  solidColor: [0, 0, 1, 1],
})
hoverCube.setPosition([-1, 0, 0])
hoverCube.setScale([1.05, 1.05, 1.05])
hoverCube.setParent(rootNode)

document.body.addEventListener('mousemove', onMouseMove)
document.body.addEventListener('click', onMouseClick)
requestAnimationFrame(updateFrame)

function onMouseMove(e: MouseEvent) {
  store.dispatch(setMousePos([e.pageX, e.pageY]))
}

async function onMouseClick(e: MouseEvent) {
  const normX = (e.pageX / innerWidth) * 2 - 1
  const normY = 2 - (e.pageY / innerHeight) * 2 - 1
  const { rayStart, rayEnd, rayDirection } = projectMouseToWorldSpace(
    [normX, normY],
    perspectiveCamera,
  )

  // debugger
  if (e.metaKey) {
    debugLines.push(new Line(gl, rayStart, rayEnd))
  }

  const {
    ui: { isCurrentlyTransitionViews },
  } = store.getState()

  // console.log(isCurrentlyTransitionViews)
  // if (isCurrentlyTransitionViews) {
  //   return
  // }

  const hitView = getHoveredSceneNode(rayStart, rayDirection)

  const prevLevel = prevView?.levelIndex || 0
  const currLevel = hitView?.levelIndex

  if (hitView) {
    store.dispatch(setShowCubeHighlight(false))
  }

  console.clear()
  console.log(hitView?.name, prevView?.name)

  let showChildRow = true
  if (prevView) {
    // debugger
    if (currLevel < prevLevel) {
      const viewsToClose: SceneNode[] = []

      await new Promise((resolve) => {
        prevView.traverse((child) => {
          const view = child as View
          if (view.findParentByName(View.MESH_WRAPPER_NAME)) {
            return
          }
          if (view.levelIndex === prevView.levelIndex) {
            viewsToClose.push(...view.siblings)
          }
          if (view.levelIndex > prevView.levelIndex) {
            viewsToClose.push(view)
          }
          new Tween({
            durationMS: 1000,
            easeName: 'linear',
            onUpdate: (v) => {
              for (let i = 0; i < viewsToClose.length; i++) {
                const view = viewsToClose[i] as View
                const sc = 1 - v
                view.hide(sc, sc, sc)
                view.updateWorldMatrix()
              }
            },
            onComplete: () => resolve(null),
          }).start()
        })
      })

      for (let i = 0; i < viewsToClose.length; i++) {
        const view = viewsToClose[i] as View
        view.visible = false
      }

      hitView.open = false

      showChildRow = !prevView.findParentByName(hitView.name as string)
    } else if (currLevel === prevLevel) {
      if (hitView.name === prevView.name) {
        for (let i = 0; i < hitView.children.length; i++) {
          const view = hitView.children[i] as View
          view.visible = true
        }
        console.log(`hitview was ${hitView.open ? 'open' : 'not open'}`)
        const hitViewOpen = hitView.open
        await new Promise((resolve) => {
          new Tween({
            durationMS: 1000,
            easeName: 'quart_InOut',
            onUpdate: (v) => {
              for (let i = 0; i < hitView.children.length; i++) {
                const view = hitView.children[i] as View
                if (hitViewOpen) {
                  const sc = 1 - v
                  view.hide(sc, sc, sc)
                } else {
                  const sc = v
                  view.reveal(sc, sc, sc)
                }
                view.updateWorldMatrix()
              }
            },
            onComplete: () => resolve(null),
          }).start()
        })
        for (let i = 0; i < hitView.children.length; i++) {
          const view = hitView.children[i] as View
          view.visible = !hitViewOpen
        }
        hitView.open = !hitViewOpen
        showChildRow = false
      } else {
        await new Promise((resolve) =>
          new Tween({
            durationMS: 1000,
            easeName: 'quart_In',
            onUpdate: (v) => {
              for (let i = 0; i < prevView.children.length; i++) {
                const view = prevView.children[i] as View
                const sc = 1 - v
                view.hide(sc, sc, sc)
                view.updateWorldMatrix()
              }
            },
            onComplete: () => resolve(null),
          }).start(),
        )

        for (let i = 0; i < prevView.children.length; i++) {
          const view = prevView.children[i] as View
          view.visible = false
        }

        hitView.open = !hitView.open
      }
    }
  }

  if (showChildRow && hitView) {
    console.log('animate hitview children shelf')
    for (let i = 0; i < hitView.children.length; i++) {
      const view = hitView.children[i] as View
      view.loadThumbnail()
      view.visible = true
    }
    await new Promise((resolve) =>
      new Tween({
        durationMS: 1000,
        easeName: 'cubic_Out',
        onUpdate: (v) => {
          const startRot = Math.PI
          const startDeformAngle = Math.PI
          for (let i = 0; i < hitView.children.length; i++) {
            const view = hitView.children[i] as View
            const rot = startRot * (1 - v)
            const deformAngle = startDeformAngle * (1 - v)
            view.reveal(v, v, v, rot, 0, 0, deformAngle)
            view.updateWorldMatrix()
          }
        },
        onComplete: () => resolve(null),
      }).start(),
    )
    store.dispatch(setShowCubeHighlight(true))
    store.dispatch(setIsCurrentlyTransitionViews(false))
    hitView.open = true
  }

  // console.log('currLevel', currLevel, 'prevLevel', prevLevel)
  if (hitView) {
    console.log(
      `new hitview ${hitView.name} is ${hitView.open ? 'open' : 'not open'}`,
    )
    prevView = hitView
  }
}

function updateFrame(ts: DOMHighResTimeStamp) {
  requestAnimationFrame(updateFrame)

  // console.log(perspectiveCamera.position)

  perspectiveCamera.updateViewMatrix().updateProjectionViewMatrix()

  const {
    ui: { mousePos },
  } = store.getState()
  const normX = (mousePos[0] / innerWidth) * 2 - 1
  const normY = 2 - (mousePos[1] / innerHeight) * 2 - 1
  const { rayStart, rayEnd, rayDirection } = projectMouseToWorldSpace(
    [normX, normY],
    perspectiveCamera,
  )

  const hitView = getHoveredSceneNode(rayStart, rayDirection)
  store.dispatch(setIsHovering(!!hitView))

  const {
    ui: { showCubeHighlight },
  } = store.getState()

  if (hitView && showCubeHighlight) {
    hoverCube.setPosition(hitView.position)
  } else {
    hoverCube.setPosition([100, 100, 100])
  }

  gl.enable(gl.DEPTH_TEST)

  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
  gl.clearColor(0.1, 0.1, 0.1, 1.0)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  if (uboCamera) {
    gl.bindBuffer(gl.UNIFORM_BUFFER, uboCamera)
    gl.bufferSubData(
      gl.UNIFORM_BUFFER,
      uboCameraBlockInfo.uniforms.projectionViewMatrix.offset,
      perspectiveCamera.projectionViewMatrix as ArrayBufferView,
      0,
    )
  }

  gl.bindBuffer(gl.UNIFORM_BUFFER, null)

  if (uboCamera) {
    boxesRootNode.render(ts)

    gl.enable(gl.CULL_FACE)
    gl.cullFace(gl.FRONT)
    hoverCube.updateWorldMatrix()
    hoverCube.render(ts)

    gl.disable(gl.CULL_FACE)
  }

  debugLines.forEach((rayLine) => rayLine.render())
}

function getHoveredSceneNode(rayStart: vec3, rayDirection: vec3): View {
  let prevRayTimeSample = Infinity // better name?
  let hitView!: View

  boxesRootNode.traverse((child) => {
    if (!(child instanceof View)) {
      return
    }

    const rayTime = child.testRayIntersection(rayStart, rayDirection)

    if (rayTime !== null && rayTime < prevRayTimeSample) {
      prevRayTimeSample = rayTime
      hitView = child
    }
  })

  return hitView
}
