import { vec3 } from 'gl-matrix'
import {
  CUBE_HEIGHT,
  CUBE_WIDTH,
  FONT_STACK,
  LAYOUT_COLUMN_MAX_WIDTH,
  LAYOUT_ITEMS_PER_ROW,
  LAYOUT_LEVEL_Y_OFFSET,
  LAYOUT_LEVEL_Z_OFFSET,
} from './constants'

import View from './view'

import { Project, ProjectGroup } from './interfaces'
import { Tween, TweenProps } from './lib/hwoa-rang-anim'
import { SceneNode } from './lib/hwoa-rang-gl2'

/**
 *
 * @param entries
 * @returns {Project[]}
 */
export const transformProjectEntries = (entries: any): Project[] => {
  console.log(entries)
  return entries.map((entry: any) => ({
    uid: entry.uid,
    title: entry.data.project_title[0].text,
    type: entry.data.project_type[0].text,
    year: parseInt(entry.data.project_year[0].text, 10),
    url: entry.data.project_link?.url,
    tech: entry.data.project_tech[0].text,
    date: {
      first: entry.first_publication_date,
      last: entry.last_publication_date,
    },
    image: {
      url: entry.data.project_image.url,
      width: entry.data.project_image.dimensions.width,
      height: entry.data.project_image.dimensions.height,
    },
  }))
}

/**
 *
 * @param projectEntries
 * @returns {ProjectGroup}
 */
export const sortProjectEntriesByYear = (
  projectEntries: Project[],
): ProjectGroup => {
  const byYear = [...projectEntries].reduce((acc: ProjectGroup, item) => {
    const key = item.year
    if (!acc[key]) {
      acc[key] = [item]
    } else {
      acc[key].push(item)
    }
    return acc
  }, {})
  return byYear
}

/**
 *
 * @param projectEntries
 * @returns
 */
export const sortProjectEntriesByType = (
  projectEntries: Project[],
): ProjectGroup => {
  return projectEntries.reduce((acc: ProjectGroup, item) => {
    const projectType = item.type
    if (!acc[projectType]) {
      acc[projectType] = [item]
    } else {
      acc[projectType] = [...acc[projectType], item]
    }
    return acc
  }, {})
}

export const getXYZForViewIdxWithinLevel = (
  viewIdx: number,
  levelIdx: number = 0,
  optionalOffset?: vec3,
): vec3 => {
  const normX = viewIdx % LAYOUT_ITEMS_PER_ROW
  const normY = ((viewIdx - normX) / LAYOUT_ITEMS_PER_ROW) * -1
  const stepX = LAYOUT_COLUMN_MAX_WIDTH / LAYOUT_ITEMS_PER_ROW
  const padding = (stepX / CUBE_WIDTH) * 1.4
  const x = normX * stepX + stepX / 2 - LAYOUT_COLUMN_MAX_WIDTH / 2
  const y = normY * CUBE_HEIGHT * padding - LAYOUT_LEVEL_Y_OFFSET * levelIdx
  const z = levelIdx * LAYOUT_LEVEL_Z_OFFSET
  const pos = vec3.fromValues(x, y, z)
  if (optionalOffset) {
    vec3.add(pos, pos, optionalOffset)
  }
  return pos
}

export const getChildrenRowTotalHeight = (childrenCount: number) => {
  const rowsCount = Math.ceil(childrenCount / LAYOUT_ITEMS_PER_ROW)
  const stepX = LAYOUT_COLUMN_MAX_WIDTH / LAYOUT_ITEMS_PER_ROW
  const padding = (stepX / CUBE_WIDTH) * 1.4
  const rowHeight = rowsCount * CUBE_HEIGHT * padding + CUBE_HEIGHT / 2
  // debugger
  return rowHeight
}

export const promisifiedLoadImage = (
  src: string,
): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = (err) => reject(err)
    image.crossOrigin = 'anonymous'
    image.src = src
  })
}

export const promisifiedTween = ({
  durationMS,
  delayMS,
  easeName,
  onUpdate,
  onComplete,
}: TweenProps): Promise<null> =>
  new Promise((resolve) =>
    new Tween({
      durationMS,
      delayMS,
      easeName,
      onUpdate,
      onComplete: () => {
        if (onComplete) {
          onComplete()
        }
        resolve(null)
      },
    }).start(),
  )

export const openURL = (url: string): void => {
  if (url.startsWith('mailto')) {
    window.open(url)
  } else {
    window.open(url, '_blank')
  }
}

export const traverseViewNodes = (
  node: SceneNode,
  callback: (node: View) => void,
) => {
  node.traverse((child) => {
    if (!(child instanceof View)) {
      return
    }
    callback(child)
  })
}

export const capitalizeFirstLetter = (v: string): string => {
  return `${v.charAt(0).toUpperCase()}${v.slice(1)}`
}

// about section label texts helpers
const aboutSectionTemplateCanvas = (
  label: string,
  width = 400,
): [HTMLCanvasElement, CanvasRenderingContext2D, number] => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  canvas.width = width
  const boxAspect = CUBE_WIDTH / CUBE_HEIGHT
  canvas.height = width / boxAspect
  ctx.fillStyle = '#aaa'
  ctx.font = `24px ${FONT_STACK}`
  const paddingX = 24
  const paddingY = 40
  ctx.textAlign = 'left'
  ctx.fillText(label, paddingX, paddingY)
  return [canvas, ctx, paddingX]
}

export const aboutSectionSingleLineCanvas = (
  label: string,
  text: string,
  width = 400,
): HTMLCanvasElement => {
  const [canvas, ctx, paddingX] = aboutSectionTemplateCanvas(label, width)
  ctx.fillStyle = '#fff'
  ctx.font = `62px ${FONT_STACK}`
  ctx.textBaseline = 'middle'
  const yOffset = 10
  ctx.fillText(text, paddingX, canvas.height / 2 + yOffset)
  return canvas
}

export const aboutSectionTwoLineCanvas = (
  label: string,
  text1: string,
  text2: string,
  width = 400,
): HTMLCanvasElement => {
  const [canvas, ctx, paddingX] = aboutSectionTemplateCanvas(label, width)
  ctx.fillStyle = '#fff'
  ctx.font = `62px ${FONT_STACK}`
  ctx.textBaseline = 'middle'
  const metrics = ctx.measureText(text1)
  const textHeight =
    metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent
  const lineHeight = textHeight
  const yOffset = 10
  ctx.fillText(text1, paddingX, canvas.height / 2 - lineHeight / 2 + yOffset)
  ctx.fillText(text2, paddingX, canvas.height / 2 + lineHeight / 2 + yOffset)
  return canvas
}

export const aboutSectionMultilineCanvas = (
  label: string,
  lines: string[],
  width = 400,
): HTMLCanvasElement => {
  const [canvas, ctx, paddingX] = aboutSectionTemplateCanvas(label, width)
  ctx.fillStyle = '#fff'
  ctx.font = `36px ${FONT_STACK}`

  ctx.textBaseline = 'middle'

  const metrics = ctx.measureText(lines[0])
  const textHeight =
    metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent * 1.5

  const totalHeight = textHeight * lines.length

  lines.forEach((text, i) => {
    ctx.fillText(
      text,
      paddingX,
      canvas.height / 2 - totalHeight / 4 + i * textHeight,
    )
  })
  return canvas
}
