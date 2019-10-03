import React, { useEffect, useReducer } from 'react'
import axios from 'axios'

// import {FaArrowCircleLeft} from 'react-icons/fa'
// import {FaArrowCircleRight} from 'react-icons/fa'

import { DebounceInput } from 'react-debounce-input'

import './App.css'

interface Ipoem {
  title: string,
  lines: Array<string>,
  author: string,
  [index: number]: string | Array<string> | undefined
}

interface Istate {
  search: string,
  poem: Ipoem,
  poems: Array<Ipoem>,
  viewingPoem: number,
  isFetching: boolean,
  error: string,
}

interface Iaction {
  type: string,
  payload?: any
}

const initialState: Istate = {
  search: '',
  poem: {title: '', lines: [], author: ''},
  poems: [],
  viewingPoem: 0,
  isFetching: false,
  error: '',
}

const SEARCH_CHANGED = 'SEARCH_CHANGED'
const SHOW_NEXT_POEM = 'SHOW_NEXT_POEM'
const SHOW_PREVIOUS_POEM = 'SHOW_PREVIOUS_POEM'

const GET_POEMS_REQUESTED = 'GET_POEMS_REQUESTED'
const GET_POEMS_SUCCESS = 'GET_POEMS_SUCCESS'
const GET_POEMS_FAILED = 'GET_POEMS_FAILED'

// type Action =
//   | { type: 'increment' }
//   | { type: 'decrement' }
//   | { type: 'incrementAmount'; amount: number };

function poemReducer(state = initialState, action: Iaction) {
  switch (action.type) {
    case SEARCH_CHANGED:
      return { ...state, search: action.payload }
    case SHOW_PREVIOUS_POEM:
      let prevPoemIndex = state.viewingPoem - 1
      if(prevPoemIndex < 0) { prevPoemIndex = 0 }
      return {
        ...state,
        viewingPoem: prevPoemIndex,
        poem: {
          title: state.poems[prevPoemIndex].title,
          author: state.poems[prevPoemIndex].author,
          lines: state.poems[prevPoemIndex].lines,
        },
      }
    case SHOW_NEXT_POEM:
      let nextPoemIndex = state.viewingPoem + 1
      if(nextPoemIndex > state.poems.length - 1) { nextPoemIndex = state.poems.length - 1 }
      return {
        ...state,
        viewingPoem: nextPoemIndex,
        poem: {
          title: state.poems[nextPoemIndex].title,
          author: state.poems[nextPoemIndex].author,
          lines: state.poems[nextPoemIndex].lines,
        },
      }
    case GET_POEMS_REQUESTED:
      return { ...state, isFetching: true, error: '' }
    case GET_POEMS_SUCCESS:
      return {
        ...state,
        poems: action.payload,
        viewingPoem: 0,
        poem: {
          title: action.payload[0].title,
          author: action.payload[0].author,
          lines: action.payload[0].lines,
        },
        isFetching: false,
      }
    case GET_POEMS_FAILED:
      return { ...state, error: action.payload, isFetching: false }
    default:
      return initialState
  }
}
// 
// const BrowsePoems = ({
//   numberOfPoems,
//   viewingPoem,
//   dispatch
// }) => {
//   return (
//     <div className="poem-arrows">
//       {/* <FaArrowCircleLeft */}
//       {/*   className={ `arrow ${viewingPoem === 0 ? 'hide-arrow' : null}`} */}
//       {/*   onClick={() => dispatch({ type: SHOW_PREVIOUS_POEM })} */}
//       {/* /> */}
//       {/* <div className="poem-number">{viewingPoem + 1} of {numberOfPoems}</div> */}
//       {/* <FaArrowCircleRight */}
//       {/*   className={ `arrow ${viewingPoem === numberOfPoems - 1 ? 'hide-arrow' : null}`} */}
//       {/*   onClick={() => dispatch({ type: SHOW_NEXT_POEM })} */}
//       {/* /> */}
//     </div>
//   )
// }

function App() {
  const [state, dispatch] = useReducer(poemReducer, initialState)

  useEffect(() => {
    const searchTerm: string = encodeURIComponent(state.search)
    const source = axios.CancelToken.source()

    if(searchTerm) {
      dispatch({ type: GET_POEMS_REQUESTED })
      axios.get(`http://poetrydb.org/lines/${searchTerm}/.json`).then(response => {
        if(response && response.data.status === 404) {
          dispatch({ type: GET_POEMS_FAILED, payload: 'No poems for this search term' })
        } else if(response && response.data.length) {
          dispatch({ type: GET_POEMS_SUCCESS, payload: response.data })
        }
      })
      .catch(error => {
        dispatch({ type: GET_POEMS_FAILED, payload: error.toString() })
      })
    }

    return () => {
      source.cancel()
    }
  }, [state.search])

  return (
    <div className="app-body">
      <div className="tagline">
        Enter a word or two and we'll find you some poems
      </div>

      <DebounceInput
        placeholder="word(s)"
        minLength={2}
        debounceTimeout={800}
        onChange={e => dispatch({ type: SEARCH_CHANGED, payload: e.target.value }) }
        disabled={state.isFetching}
      />

      {state.isFetching && `Finding you poems...`}

      <span className="error">{state.error && `Oh no: ${state.error}.`}</span>
{/*  */}
{/*       { !state.isFetching && state.poems.length > 1 && */}
{/*         <BrowsePoems */}
{/*           numberOfPoems={state.poems.length} */}
{/*           viewingPoem={state.viewingPoem} */}
{/*           dispatch={dispatch} */}
{/*         /> */}
{/*       } */}
{/*  */}
      <div>
        <h1>{state.poem.title}</h1>
        <h2>{state.poem.author}</h2>
      </div>
      <div className="poem-lines">
        { state.poem.lines.map((line: string, index: number) => <div key={index}>{line}</div>) }
      </div>
      { state.poems.length === 0 && !state.isFetching && state.search && <div>No Poems Found :(</div>}

    </div>
  );
}

export default App;
