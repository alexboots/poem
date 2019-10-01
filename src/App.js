import React, { useEffect, useState, useReducer } from 'react'
import axios from 'axios'

import FaArrowCircleLeft from 'react-icons/lib/fa/arrow-circle-left'
import FaArrowCircleRight from 'react-icons/lib/fa/arrow-circle-right'

import { DebounceInput } from 'react-debounce-input'

import './App.css'

const initialState = {
}

function poemReducer(state, action) {
  switch (action.type) {
    case 'increment':
      return {count: state.count + 1};
    case 'decrement':
      return {count: state.count - 1};
    default:
      return initialState
}

function App() {
  const [search, setSeach] = useState('')
  const [poemLines, setPoemLines] = useState([])
  const [poemSelected, setPoemSelected] = useState([])
  const [numberOfPoems, setNumberOfPoems] = useState(0)
  const [noPoemsFound, setNoPoemsFound] = useState(false)
  const [catchError, setCatchError] = useState('')
  const [catchError, setCatchError] = useState('')


  const [state, dispatch] = useReducer(poemReducer, initialState);

  useEffect(() => {
    const searchTerm = encodeURIComponent(search)
    if(searchTerm) {
      axios.get(`http://poetrydb.org/lines/${searchTerm}/.json`).then(response => {
        if(response && response.data.status === 404) {
          setNoPoemsFound(true)
        } else if(response && response.data.length) {
          setPoemLines(response.data[0].lines)

          console.log('response.data', response.data);
          setNumberOfPoems(response.data.length)
        }
      })
      .catch(error => {
        console.log("here", error);
        setCatchError(error.toString())
      })
      .finally(() => {
        console.log('alldone');
      })
    }
  }, [search])

  console.log('numberOfPoems', numberOfPoems)

  return (
    <div className="app-body">
      <div className="tagline">Seach a word or two and we'll find you a poem</div>

      <DebounceInput
        placeholder="word(s)"
        minLength={2}
        debounceTimeout={800}
        onChange={e => setSeach(e.target.value) }
        disabled={false}
      />

      <span className="error">{ catchError && `Oh no: ${catchError}. Bug @alexboots about it.` }</span>

      { numberOfPoems > 1 &&
        <>
          <div className="prev-poem"> <FaArrowCircleLeft /> </div>
          <div className="next-poem"> <FaArrowCircleRight /> </div>
        </>
      }

      <div className="poem-lines">
        { poemLines.map((line, index) => <div key={index}>{line}</div>) }
      </div>
      { noPoemsFound && <div>No Poems Found :(</div>}

    </div>
  );
}

export default App;
