import thunk from 'redux-thunk'
import { applyMiddleware, combineReducers } from 'redux'
import { configureStore } from '@reduxjs/toolkit'

import ui, { UIState } from './ui'

export interface CombinedState {
  ui: UIState
}

export default configureStore({
  reducer: combineReducers({ ui }),
  enhancers: [applyMiddleware(thunk)],
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  devTools:
    (window as any).__REDUX_DEVTOOLS_EXTENSION__ &&
    (window as any).__REDUX_DEVTOOLS_EXTENSION__(),
})
