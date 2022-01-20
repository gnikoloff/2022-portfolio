import { Project } from './interfaces'
import store from './store'

import Line from './meshes/line'

import './style.css'

import {
  getChildrenRowTotalHeight,
  getXYZForViewIdxWithinLevel,
  sortProjectEntriesByYear,
  transformProjectEntries,
} from './helpers'

import {
  setActiveLevelIdx,
  setIsCurrentlyTransitionViews,
  setIsHovering,
  setMousePos,
  setShowCubeHighlight,
} from './store/ui'
import View from './views/view'

import {
  CameraController,
  createPlane,
  createBox,
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
  createFramebuffer,
  TextureAtlas,
  mapNumberRange,
} from './lib/hwoa-rang-gl2/dist'

import { Tween } from './lib/hwoa-rang-anim/dist'

import Cube from './meshes/cube'

import { mat4, vec3 } from 'gl-matrix'
import {
  CAMERA_FAR,
  CAMERA_FOCUS_OFFSET_Z,
  CAMERA_LEVEL_Z_OFFSET,
  CAMERA_NEAR,
  CUBE_DEPTH,
  CUBE_HEIGHT,
  CUBE_WIDTH,
  LABEL_HEIGHT,
  LABEL_WIDTH,
  LAYOUT_COLUMN_MAX_WIDTH,
  LAYOUT_LEVEL_Y_OFFSET,
  TRANSITION_CAMERA_DURATION,
  TRANSITION_CAMERA_EASE,
  TRANSITION_ROW_DELAY,
  TRANSITION_ROW_DURATION,
  TRANSITION_ROW_EASE,
} from './constants'

import * as dat from 'dat.gui'
import Quad from './meshes/quad'

const OPTIONS = {
  cameraFreeMode: false,
  blurIterations: 25,
  dofInnerRange: 0.3,
  dofOuterRange: 0.47,
  dof: -0.02269,
}

let oldTime = 0

const gui = new dat.GUI()

gui.add(OPTIONS, 'cameraFreeMode').onChange((v) => {
  if (v) {
    orbitController.start()
  } else {
    orbitController.pause()
  }
})
const optionsStep = 0.00001
gui.add(OPTIONS, 'blurIterations').min(1).max(25).step(1)
// gui
//   .add(OPTIONS, 'dofInnerRange')
//   .min(0.1)
//   .max(2)
//   .step(optionsStep)
//   .onChange((v: number) => {
//     // console.log([v, OPTIONS.dofOuterRange])
//     dofQuad.updateUniform(
//       'u_depthRange',
//       new Float32Array([v, OPTIONS.dofOuterRange]),
//     )
//   })
// gui
//   .add(OPTIONS, 'dofOuterRange')
//   .min(0.1)
//   .max(2)
//   .step(optionsStep)
//   .onChange((v: number) => {
//     // console.log([OPTIONS.dofInnerRange, v])
//     dofQuad.updateUniform(
//       'u_depthRange',
//       new Float32Array([OPTIONS.dofInnerRange, v]),
//     )
//   })
// gui
//   .add(OPTIONS, 'dof')
//   .min(-2)
//   .max(1)
//   .step(optionsStep)
//   .onChange((v: number) => {
//     dofQuad.updateUniform('u_dof', v)
//   })

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

let uboPerspectiveCamera: WebGLBuffer
let uboCameraBlockInfo: UBOInfo
let uboOrthographicCamera: WebGLBuffer

// TextureAtlas.debugMode = true
TextureAtlas.gl = gl

// console.log(texManager)

const freeOrbitCamera = new PerspectiveCamera(
  deg2Rad(70),
  $canvas.width / $canvas.height,
  CAMERA_NEAR,
  CAMERA_FAR,
)
freeOrbitCamera.position = [0, 2, 3]
freeOrbitCamera.lookAt = [0, 0, 0]

const perspectiveCamera = new PerspectiveCamera(
  deg2Rad(70),
  $canvas.width / $canvas.height,
  CAMERA_NEAR,
  CAMERA_FAR,
)
{
  const camCenterY = -getChildrenRowTotalHeight(4) / 2
  perspectiveCamera.position = [0, camCenterY, 8]
  perspectiveCamera.lookAt = [0, camCenterY, 0]
}

const orbitController = new CameraController(freeOrbitCamera)
orbitController.pause()

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

let singleView

const cubeGeometry = createBox({
  width: CUBE_WIDTH,
  height: CUBE_HEIGHT,
  depth: CUBE_DEPTH,
  widthSegments: 30,
  depthSegments: 30,
  uvOffsetEachFace: true,
})

const blurDirection = new Float32Array([1, 0])

// const fboCopy = createFramebuffer(gl, innerWidth, innerHeight, true, 'fboCopy')
// const fboBlurPing = createFramebuffer(
//   gl,
//   innerWidth,
//   innerHeight,
//   false,
//   'blurPing',
// )
// const fboBlurPong = createFramebuffer(
//   gl,
//   innerWidth,
//   innerHeight,
//   false,
//   'blurPong',
// )

// const fullscreenQuadGeo = createPlane({
//   width: innerWidth,
//   height: innerHeight,
//   flipUVy: true,
// })

// const blurQuad = new Quad(gl, {
//   geometry: fullscreenQuadGeo,
//   uniforms: {
//     u_diffuse: {
//       type: gl.INT,
//       value: 0,
//     },
//     u_resolution: {
//       type: gl.FLOAT_VEC2,
//       value: new Float32Array([innerWidth, innerHeight]),
//     },
//     u_blurDirection: {
//       type: gl.FLOAT_VEC2,
//       value: blurDirection,
//     },
//   },
//   defines: { USE_TEXTURE: true, USE_GAUSSIAN_BLUR: true },
//   name: 'blurQuad',
// })
// const dofQuad = new Quad(gl, {
//   geometry: fullscreenQuadGeo,
//   uniforms: {
//     u_diffuse: {
//       type: gl.INT,
//       value: 0,
//     },
//     u_blurTexture: {
//       type: gl.INT,
//       value: 1,
//     },
//     u_depthTexture: {
//       type: gl.INT,
//       value: 2,
//     },
//     u_depthRange: {
//       type: gl.FLOAT_VEC2,
//       value: new Float32Array([OPTIONS.dofInnerRange, OPTIONS.dofOuterRange]),
//     },
//     u_dof: {
//       type: gl.FLOAT,
//       value: OPTIONS.dof,
//     },
//   },
//   defines: {
//     USE_TEXTURE: true,
//     USE_DOF: true,
//   },
// })

fetch('http://192.168.2.123:3001/api')
  .then((projects) => projects.json())
  .then(transformProjectEntries)
  .then((projects: Project[]) => {
    const viewGeoPartialProps = { cubeGeometry, labelGeometry }
    const projectsByYear = sortProjectEntriesByYear(projects)

    // singleView = new SingleView(gl, {
    //   imageGeometry,
    //   descGeometry,
    //   project: projects[0],
    //   name: 'ar',
    // })
    // singleView.updateWorldMatrix()

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
    uboPerspectiveCamera = createAndBindUBOToBase(
      gl,
      uboCameraBlockInfo.blockSize,
      0,
    )!
    uboOrthographicCamera = createAndBindUBOToBase(
      gl,
      uboCameraBlockInfo.blockSize,
      1,
    )!

    projectsNode.setPosition(getXYZForViewIdxWithinLevel(1, 0))
    projectsNode.loadThumbnail()
    projectsNode.visibilityTweenFactor = 1
    projectsNode.visible = true
    projectsNode.setParent(boxesRootNode)

    const aboutNode = new View(gl, { ...viewGeoPartialProps, name: 'about' })
    aboutNode.loadThumbnail()
    aboutNode.visibilityTweenFactor = 1
    aboutNode.visible = true
    aboutNode.setParent(boxesRootNode)

    const aaaaaaNode = new View(gl, { ...viewGeoPartialProps, name: 'aa' })
    aaaaaaNode.loadThumbnail()
    aaaaaaNode.visibilityTweenFactor = 1
    aaaaaaNode.visible = false
    aaaaaaNode.setParent(aboutNode)

    const contactNode = new View(gl, {
      ...viewGeoPartialProps,
      name: 'contact',
    })
    contactNode.loadThumbnail()
    contactNode.visibilityTweenFactor = 1
    contactNode.visible = true
    contactNode.setParent(boxesRootNode)

    const blogNode = new View(gl, {
      ...viewGeoPartialProps,
      name: 'blog',
    })
    blogNode.loadThumbnail()
    blogNode.visibilityTweenFactor = 1
    blogNode.visible = true
    blogNode.setParent(boxesRootNode)

    for (const [key, projects] of Object.entries(projectsByYear)) {
      const yearNode = new View(gl, { ...viewGeoPartialProps, name: key })
      yearNode.visibilityTweenFactor = 0
      yearNode.setParent(projectsNode)
      for (let i = 0; i < projects.length; i++) {
        const project = projects[i]
        const projectNode = new View(gl, {
          ...viewGeoPartialProps,
          name: project.title,
          project,
          hasLabel: true,
        })
        projectNode.visibilityTweenFactor = 0
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

const imageGeometry = createBox({
  width: LAYOUT_COLUMN_MAX_WIDTH * (2 / 3) * 0.95,
  height: LAYOUT_COLUMN_MAX_WIDTH * (2 / 3) * 0.5 * 0.95,
  depth: LAYOUT_COLUMN_MAX_WIDTH * (2 / 3) * 0.5 * 0.95,
  uvOffsetEachFace: true,
})
const descGeometry = createBox({
  width: 4,
  height: 2,
  depth: 2,
  uvOffsetEachFace: true,
})
const labelGeometry = createPlane({
  width: LABEL_WIDTH,
  height: LABEL_HEIGHT,
})

const hoverCube = new Cube(gl, {
  geometry: cubeGeometry,
  solidColor: [0, 0, 1, 1],
})
hoverCube.setPosition([-1, 0, 0])
hoverCube.setScale([1.05, 1.05, 1.05])
hoverCube.setParent(rootNode)

document.body.addEventListener('mousemove', onMouseMove)
document.body.addEventListener('click', onMouseClick)
// document.body.addEventListener('touchstart', (e) => e.preventDefault())
// document.body.addEventListener('touchmove', (e) => e.preventDefault())
requestAnimationFrame(updateFrame)

function onMouseMove(e: MouseEvent) {
  store.dispatch(setMousePos([e.pageX, e.pageY]))
}

async function onMouseClick(e: MouseEvent) {
  const normX = (e.pageX / innerWidth) * 2 - 1
  const normY = 2 - (e.pageY / innerHeight) * 2 - 1
  const { rayStart, rayEnd, rayDirection } = projectMouseToWorldSpace(
    [normX, normY],
    OPTIONS.cameraFreeMode ? freeOrbitCamera : perspectiveCamera,
  )

  // debugger
  if (e.metaKey) {
    debugLines.push(new Line(gl, rayStart, rayEnd))
  }

  const {
    ui: { isCurrentlyTransitionViews },
  } = store.getState()

  if (isCurrentlyTransitionViews) {
    return
  }
  const hitView = getHoveredSceneNode(rayStart, rayDirection)

  if (!hitView) {
    let newLevelIndex = store.getState().ui.activeLevelIdx
    if (newLevelIndex === -1) {
      return
    }

    if (prevView?.project) {
      new Tween({
        durationMS: 500,
        easeName: 'exp_In',
        onUpdate: (v) => {
          boxesRootNode.traverse((child) => {
            if (!(child instanceof View)) {
              return
            }
            if (child === prevView) {
              // child.fadeFactor = v
              return
            }
            child.fadeFactor = mapNumberRange(v, 0, 1, 0.2, 1)
          })
        },
      }).start()
    }

    const viewsToClose: SceneNode[] = []

    await new Promise((resolve) => {
      rootNode.traverse((child) => {
        const view = child as View
        if (view.findParentByName(View.MESH_WRAPPER_NAME)) {
          return
        }
        // if (view.levelIndex === prevView.levelIndex) {
        //   viewsToClose.push(...view.siblings)
        // }
        if (view.levelIndex > newLevelIndex + 2) {
          viewsToClose.push(view)
        }
        new Tween({
          durationMS: TRANSITION_ROW_DURATION,
          easeName: TRANSITION_ROW_EASE,
          onUpdate: (v) => {
            for (let i = 0; i < viewsToClose.length; i++) {
              const view = viewsToClose[i] as View
              view.visibilityTweenFactor = 1 - v
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

    console.log({ newLevelIndex })

    let childrenPrevRowCount = 0
    rootNode.traverse((child) => {
      const view = child as View
      if (view.levelIndex === newLevelIndex + 2) {
        childrenPrevRowCount++
      }
    })

    console.log({ childrenPrevRowCount })

    const oldCamX = perspectiveCamera.position[0]
    const oldCamY = perspectiveCamera.position[1]
    const oldCamLookAtX = perspectiveCamera.lookAt[0]
    const oldCamLookAtY = perspectiveCamera.lookAt[1]
    const oldCamZ = perspectiveCamera.position[2]
    const rowHeight = getChildrenRowTotalHeight(childrenPrevRowCount)
    const offset = -2
    const rowCenter =
      -rowHeight / 2 - LAYOUT_LEVEL_Y_OFFSET * (newLevelIndex + 2 + offset)

    const offsetPos = 8 + (newLevelIndex + 2 + offset) * CAMERA_LEVEL_Z_OFFSET

    const cameraTargetX = 0
    const cameraTargetY = rowCenter

    new Tween({
      durationMS: TRANSITION_CAMERA_DURATION,
      easeName: TRANSITION_CAMERA_EASE,
      onUpdate: (v) => {
        perspectiveCamera.position[0] = oldCamX + (cameraTargetX - oldCamX) * v
        perspectiveCamera.position[1] = oldCamY + (cameraTargetY - oldCamY) * v
        perspectiveCamera.position[2] = oldCamZ + (offsetPos - oldCamZ) * v

        perspectiveCamera.lookAt[0] = oldCamLookAtX - oldCamLookAtX * v
        perspectiveCamera.lookAt[1] =
          oldCamLookAtY + (rowCenter - oldCamLookAtY) * v
      },
      onComplete: () => {},
    }).start()

    newLevelIndex--
    store.dispatch(setActiveLevelIdx(newLevelIndex))
    prevView = hitView
    return
  }
  store.dispatch(setActiveLevelIdx(hitView.levelIndex - 2))
  store.dispatch(setIsCurrentlyTransitionViews(true))

  if (hitView.project) {
    const projectX = hitView.position[0]
    const projectY = hitView.position[1]
    const projectZ = hitView.position[2]
    const newZ = projectZ + CAMERA_FOCUS_OFFSET_Z

    const camOldX = perspectiveCamera.position[0]
    const camOldY = perspectiveCamera.position[1]
    const camOldZ = perspectiveCamera.position[2]
    const camOldLookAtX = perspectiveCamera.lookAt[0]
    const camOldLookAtY = perspectiveCamera.lookAt[1]
    const camOldLookAtZ = perspectiveCamera.lookAt[2]

    await Promise.all([
      new Promise((resolve) =>
        new Tween({
          durationMS: 500,
          easeName: 'quad_InOut',
          onUpdate: (v) => {
            const posX = camOldX + (projectX - camOldX) * v
            const posY = camOldY + (projectY - camOldY) * v
            const posZ = camOldZ + (newZ - camOldZ) * v

            perspectiveCamera.position = [posX, posY, posZ]
          },
          onComplete: () => resolve(null),
        }).start(),
      ),
      new Promise((resolve) =>
        new Tween({
          durationMS: 475,
          easeName: 'quad_InOut',
          onUpdate: (v) => {
            const lookAtX = camOldLookAtX + (projectX - camOldLookAtX) * v
            const lookAtY = camOldLookAtY + (projectY - camOldLookAtY) * v
            const lookAtZ = camOldLookAtZ + (projectZ - camOldLookAtZ) * v

            perspectiveCamera.lookAt = [lookAtX, lookAtY, lookAtZ]
          },
          onComplete: () => resolve(null),
        }).start(),
      ),
      new Promise((resolve) =>
        prevView?.project
          ? new Tween({
              durationMS: 400,
              easeName: 'linear',
              onUpdate: (v) => {
                prevView.fadeFactor = mapNumberRange(v, 0, 1, 1, 0.2)
                hitView.fadeFactor = v
              },
              onComplete: () => resolve(null),
            }).start()
          : new Tween({
              durationMS: 400,
              easeName: 'linear',
              onUpdate: (v) => {
                boxesRootNode.traverse((child) => {
                  if (!(child instanceof View)) {
                    return
                  }
                  if (child === hitView) {
                    // child.fadeFactor = v
                    return
                  }
                  child.fadeFactor = mapNumberRange(v, 0, 1, 1, 0.2)
                })
              },
              onComplete: () => resolve(null),
            }).start(),
      ),
    ])

    perspectiveCamera.position = [projectX, projectY, newZ]
    perspectiveCamera.lookAt = [projectX, projectY, projectZ]
    perspectiveCamera.updateViewMatrix().updateProjectionViewMatrix()
    console.log('swap')
    prevView = hitView

    store.dispatch(setIsCurrentlyTransitionViews(false))

    return
  }

  if (prevView?.project) {
    new Tween({
      durationMS: 500,
      easeName: 'exp_In',
      onUpdate: (v) => {
        boxesRootNode.traverse((child) => {
          if (!(child instanceof View)) {
            return
          }
          if (child === hitView) {
            child.fadeFactor = v
            return
          }
          child.fadeFactor = mapNumberRange(v, 0, 1, 0.2, 1)
        })
      },
    }).start()
  }

  const prevLevel = prevView?.levelIndex || 0
  const currLevel = hitView.levelIndex

  store.dispatch(setShowCubeHighlight(false))

  let showChildRow = true
  let childRowHasDelay = true
  let animateCamera = true
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
            durationMS: TRANSITION_ROW_DURATION,
            easeName: TRANSITION_ROW_EASE,
            onUpdate: (v) => {
              for (let i = 0; i < viewsToClose.length; i++) {
                const view = viewsToClose[i] as View
                view.visibilityTweenFactor = 1 - v
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
        const hitViewOpen = hitView.open
        await new Promise((resolve) => {
          new Tween({
            durationMS: TRANSITION_ROW_DURATION,
            easeName: TRANSITION_ROW_EASE,
            onUpdate: (v) => {
              for (let i = 0; i < hitView.children.length; i++) {
                const view = hitView.children[i] as View
                view.visibilityTweenFactor = hitViewOpen ? 1 - v : v
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
            durationMS: TRANSITION_ROW_DURATION,
            easeName: TRANSITION_ROW_EASE,
            onUpdate: (v) => {
              console.log(prevView.children)
              for (let i = 0; i < prevView.children.length; i++) {
                const view = prevView.children[i] as View
                view.visibilityTweenFactor = 1 - v
              }
            },
            onComplete: () => resolve(null),
          }).start(),
        )

        console.log('hit here')

        for (let i = 0; i < prevView.children.length; i++) {
          const view = prevView.children[i] as View
          view.visible = false
        }

        hitView.open = !hitView.open
        childRowHasDelay = false
        if (hitView.children.length && prevView.open) {
          animateCamera = false
        }
      }
    }
  }

  // if (!hitView.children.length) {
  //   boxesRootNode.traverse((child) => {
  //     if (!(child instanceof View)) {
  //       return
  //     }
  //     if (child === hitView) {
  //       return
  //     }
  //     child.fadeFactor = 0.2
  //   })
  //   showChildRow = false
  //   animateCamera = false
  // }

  if (animateCamera) {
    const oldCamX = perspectiveCamera.position[0]
    const oldCamY = perspectiveCamera.position[1]
    const oldCamLookAtX = perspectiveCamera.lookAt[0]
    const oldCamLookAtY = perspectiveCamera.lookAt[1]
    const oldCamZ = perspectiveCamera.position[2]
    const rowHeight = getChildrenRowTotalHeight(
      (showChildRow || hitView.open ? hitView.children : hitView.siblings)
        .length,
    )
    const offset = showChildRow || hitView.open ? -1 : -2
    const rowCenter =
      -rowHeight / 2 - LAYOUT_LEVEL_Y_OFFSET * (hitView.levelIndex + offset)

    const offsetPos = 8 + (hitView.levelIndex + offset) * CAMERA_LEVEL_Z_OFFSET

    const cameraTargetX = 0
    const cameraTargetY = rowCenter

    new Tween({
      durationMS: TRANSITION_CAMERA_DURATION,
      easeName: TRANSITION_CAMERA_EASE,
      onUpdate: (v) => {
        perspectiveCamera.position[0] = oldCamX + (cameraTargetX - oldCamX) * v
        perspectiveCamera.position[1] = oldCamY + (cameraTargetY - oldCamY) * v
        perspectiveCamera.position[2] = oldCamZ + (offsetPos - oldCamZ) * v

        perspectiveCamera.lookAt[0] = oldCamLookAtX - oldCamLookAtX * v
        perspectiveCamera.lookAt[1] =
          oldCamLookAtY + (rowCenter - oldCamLookAtY) * v
      },
      onComplete: () => {},
    }).start()
  }

  if (showChildRow) {
    for (let i = 0; i < hitView.children.length; i++) {
      const view = hitView.children[i] as View
      view.loadThumbnail()
      view.visible = true
    }
    await new Promise((resolve) => {
      new Tween({
        durationMS: TRANSITION_ROW_DURATION,
        delayMS: childRowHasDelay ? TRANSITION_ROW_DELAY : 0,
        easeName: TRANSITION_ROW_EASE,
        onUpdate: (v) => {
          for (let i = 0; i < hitView.children.length; i++) {
            const view = hitView.children[i] as View
            view.visibilityTweenFactor = v
          }
        },
        onComplete: () => resolve(null),
      }).start()
    })

    store.dispatch(setShowCubeHighlight(true))

    hitView.open = true
  }
  store.dispatch(setIsCurrentlyTransitionViews(false))
  // console.log('currLevel', currLevel, 'prevLevel', prevLevel)
  if (hitView) {
    // console.log(
    //   `new hitview ${hitView.name} is ${hitView.open ? 'open' : 'not open'}`,
    // )
    prevView = hitView
  }
}

function updateFrame(ts: DOMHighResTimeStamp) {
  const dt = ts - oldTime
  oldTime = ts

  requestAnimationFrame(updateFrame)

  // console.log(freeOrbitCamera.position)

  const {
    ui: { mousePos },
  } = store.getState()
  const normX = (mousePos[0] / innerWidth) * 2 - 1
  const normY = 2 - (mousePos[1] / innerHeight) * 2 - 1
  const { rayStart, rayEnd, rayDirection } = projectMouseToWorldSpace(
    [normX, normY],
    OPTIONS.cameraFreeMode ? freeOrbitCamera : perspectiveCamera,
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

  // update camera
  {
    // const {
    //   ui: { mousePos },
    // } = store.getState()
    // const mx = mousePos[0] / innerWidth - 0.5
    // const my = mousePos[1] / innerHeight - 0.5
    // const camX = perspectiveCamera.position[0]
    // const camY = perspectiveCamera.position[1]
    // // const camZ = perspectiveCamera.position[2]
    // const speed = dt * 0.001 * 2
    // const x = camX + (mx - camX) * speed * 2
    // const y = camY + (my - camY) * speed
    // const z = perspectiveCamera.position[2]
    // // console.log(mx, my)
    // perspectiveCamera.position = [x, y, z]
  }

  freeOrbitCamera.updateViewMatrix().updateProjectionViewMatrix()
  perspectiveCamera.updateViewMatrix().updateProjectionViewMatrix()

  gl.enable(gl.DEPTH_TEST)

  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
  gl.clearColor(0.1, 0.1, 0.1, 1.0)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
  gl.enable(gl.BLEND)
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

  // UBO for perspective camera projections
  if (uboPerspectiveCamera) {
    const projViewMatix = OPTIONS.cameraFreeMode
      ? freeOrbitCamera.projectionViewMatrix
      : perspectiveCamera.projectionViewMatrix
    gl.bindBuffer(gl.UNIFORM_BUFFER, uboPerspectiveCamera)
    gl.bufferSubData(
      gl.UNIFORM_BUFFER,
      // uboCameraBlockInfo.uniforms.projectionViewMatrix.offset,
      0,
      projViewMatix as ArrayBufferView,
      0,
    )
  }

  // UBO for orthographic camera projections
  if (uboOrthographicCamera) {
    const projViewMatix = orthographicCamera.projectionViewMatrix
    gl.bindBuffer(gl.UNIFORM_BUFFER, uboOrthographicCamera)
    gl.bufferSubData(gl.UNIFORM_BUFFER, 0, projViewMatix as ArrayBufferView, 0)
  }

  gl.bindBuffer(gl.UNIFORM_BUFFER, null)

  // gl.bindFramebuffer(gl.FRAMEBUFFER, fboCopy.framebuffer)
  gl.clearColor(0.1, 0.1, 0.1, 1.0)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  if (uboPerspectiveCamera) {
    boxesRootNode.render()

    gl.enable(gl.CULL_FACE)
    gl.cullFace(gl.FRONT)
    hoverCube.updateWorldMatrix()
    hoverCube.render()

    gl.disable(gl.CULL_FACE)
  }

  if (singleView) {
    singleView.render()
  }

  debugLines.forEach((rayLine) => rayLine.render())

  // let writeBuffer = fboBlurPing
  // let readBuffer = fboBlurPong
  // const blurIterations = OPTIONS.blurIterations

  // for (let i = 0; i < blurIterations; i++) {
  //   gl.bindFramebuffer(gl.FRAMEBUFFER, writeBuffer.framebuffer)
  //   gl.clearColor(0.1, 0.1, 0.1, 1.0)
  //   gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  //   const radius = blurIterations - i - 1
  //   blurDirection[0] = i % 2 === 0 ? radius : 0
  //   blurDirection[1] = i % 2 === 0 ? 0 : radius

  //   gl.activeTexture(gl.TEXTURE0)
  //   gl.bindTexture(
  //     gl.TEXTURE_2D,
  //     i === 0 ? fboCopy.texture : readBuffer.texture,
  //   )
  //   blurQuad.updateUniform('u_blurDirection', blurDirection)
  //   blurQuad.render(1)

  //   const t = writeBuffer
  //   writeBuffer = readBuffer
  //   readBuffer = t
  // }

  // gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  // gl.activeTexture(gl.TEXTURE0)
  // gl.bindTexture(gl.TEXTURE_2D, fboCopy.texture)
  // gl.activeTexture(gl.TEXTURE1)
  // gl.bindTexture(gl.TEXTURE_2D, writeBuffer.texture)
  // gl.activeTexture(gl.TEXTURE2)
  // gl.bindTexture(gl.TEXTURE_2D, fboCopy.depthTexture!)

  // dofQuad.render(1)
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
