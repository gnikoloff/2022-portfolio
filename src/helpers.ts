import { vec3 } from 'gl-matrix'
import {
  CUBE_HEIGHT,
  CUBE_WIDTH,
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
  return entries.map((entry: any) => ({
    uid: entry.uid,
    title: entry.data.project_title[0].text,
    type: entry.data.project_type[0].text,
    year: parseInt(entry.data.project_year[0].text, 10),
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
  return [...projectEntries].reduce((acc: ProjectGroup, item) => {
    const key = item.year
    if (!acc[key]) {
      acc[key] = [item]
    } else {
      acc[key] = [...acc[key], item]
    }
    return acc
  }, {})
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
  const padding = ((stepX / CUBE_WIDTH) * 1.4) / rowsCount
  const rowHeight = rowsCount * CUBE_HEIGHT * (rowsCount > 1 ? padding : 1)
  console.log({ rowsCount, rowHeight })
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
