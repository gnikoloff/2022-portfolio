import { ActionPayload } from '../types'
import View from '../view'

const SET_ACTIVE_VIEW_UID = 'views/SET_ACTIVE_VIEW'
const ADD_VIEW_DEFINITIONS = 'views/ADD_VIEW_DEFINITIONS'
const ADD_VIEW_POSTER_TEXTURE_ATLAS_COORDS =
  'views/ADD_VIEW_POSTER_TEXTURE_ATLAS_COORDS'

export interface ViewState {
  activeViewUID: string
  views: View
}

const initialState = {
  activeViewUID: null,
  views: null,
}

const views = (state = initialState, action: ActionPayload) => {
  switch (action.type) {
    case SET_ACTIVE_VIEW_UID: {
      return {
        ...state,
        activeViewUID: action.payload,
      }
    }
    case ADD_VIEW_DEFINITIONS: {
      return {
        ...state,
        views: action.payload,
      }
    }
    case ADD_VIEW_POSTER_TEXTURE_ATLAS_COORDS: {
      return {
        ...state,
      }
    }
    default: {
      return state
    }
  }
}

export const setActiveViewUID = (uid: string) => ({
  type: SET_ACTIVE_VIEW_UID,
  payload: uid,
})

export const addViewDefinitions = (payload: View) => ({
  type: ADD_VIEW_DEFINITIONS,
  payload,
})

export const addViewPosterTextureAtlasCoords = (
  uid: string,
  texCoords: [],
) => ({
  type: ADD_VIEW_POSTER_TEXTURE_ATLAS_COORDS,
  payload: {
    uid,
    texCoords,
  },
})

export default views
