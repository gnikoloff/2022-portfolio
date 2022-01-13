import { vec3 } from 'gl-matrix'
import {
  LAYOUT_COLUMN_MAX_WIDTH,
  LAYOUT_ITEMS_PER_ROW,
  LAYOUT_LEVEL_Y_OFFSET,
  LAYOUT_LEVEL_Z_OFFSET,
} from './constants'
import { Project, ProjectGroup } from './types'

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
  return projectEntries.reduce((acc: ProjectGroup, item) => {
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
  const itemsPerRow = LAYOUT_ITEMS_PER_ROW
  const rowWidth = LAYOUT_COLUMN_MAX_WIDTH

  const normX = viewIdx % itemsPerRow
  const normY = ((viewIdx - normX) / itemsPerRow) * -1
  const stepX = rowWidth / itemsPerRow
  const x = normX * stepX + stepX / 2 - rowWidth / 2
  const y = normY * stepX - LAYOUT_LEVEL_Y_OFFSET * levelIdx
  const z = levelIdx * LAYOUT_LEVEL_Z_OFFSET
  const pos = vec3.fromValues(x, y, z)
  if (optionalOffset) {
    vec3.add(pos, pos, optionalOffset)
  }
  return pos
}

export const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = (err) => reject(err)
    image.crossOrigin = 'anonymous'
    image.src = src
  })
}
