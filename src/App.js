import './App.css';
import axios from 'axios'
import { useEffect, useState } from "react"
//import Table from "./table"
import { JsonToTable } from "react-json-to-table"

function App() {
    const [cpts, setCpts] = useState([])
    const [text, setText] = useState("")
    const [results, setResults] = useState([])
    const [suggestions, setSuggestions] = useState([])
    const [hospital, setHospital] = useState([])
    const [selectedHospital, setSelectedHospital] = useState("")
    const [showErr, setshowErr] = useState(false)

    useEffect(() => {
        const loadCpts = async () => {
            const response = await axios.get("http://3.133.150.22:3000/cpt-list")
            setCpts(response.data)
        }
        const loadHospitals = async () => {
            const response = await axios.get("http://3.133.150.22:3000/hospital-list")
            response.data.unshift({ Tables_in_mrf: "Select Hospital" })
            setHospital(response.data)
        }
        loadHospitals()
        loadCpts()
    }, [])
    const onSuggestHandler = (text) => {
      setText(text)
      setSuggestions([])
    }
    const onChangeHandler = (text) => {
        let matches = []

        if (text.length > 0) {
            matches = cpts.filter((cpt) => {
                const regex = new RegExp(`${text}`, "gi")
                return cpt.match(regex)
            })
        }
        matches = matches.slice(0,5)
        console.log("matches", matches)
        setSuggestions(matches)
        setText(text)
    }


    function handleChange(event) {
        setSelectedHospital(event)
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        //console.log('selected hospita is',selectedHospital, text)
        let procedure = text.slice(0,5)
        setshowErr(false)
        setResults([])
        
        console.log('selectedhospital',selectedHospital)
        try{
          const response = await axios.put(`http://3.133.150.22:3000/get-cpt-prices/${selectedHospital}?cpt=${procedure}`)
          console.log(response.data)
          setResults(response.data)
        } catch (err) {
          console.log(err)
        }
        if (results.length < 1){
          setshowErr(true)
        }
    }

    return (
        <div className="container-fluid text-center px-md-5 bg-white shadow-lg">
            <div className="container-xl text-center">
              <h1 className='pt-5 mb-4'>Welcome to Hospital Price Transparency Tool</h1>
              <h2 className='mb-5'>Select a hospital and a procedure code to see what others are paying for the same service</h2>
                <form onSubmit={handleSubmit}>
                    <div className="input-group mb-3">
                        <select
                            onChange={(e) => handleChange(e.target.value)}
                            value={selectedHospital}
                            className="form-select"
                            id="floatingSelect"
                        >
                            {hospital.map((item, i) => (
                                <option key={i} value={item["Tables_in_mrf"]}>
                                    {item["Tables_in_mrf"]}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group mb-5">
                        <input
                            type="text"
                            placeholder="Search For Procedure"
                            className="form-control"
                            onChange={(e) => onChangeHandler(e.target.value)}
                            value={text}
                            onBlur={() => {
                                setTimeout(() => {
                                    setSuggestions([])
                                }, 100)
                            }}
                        />
                        {suggestions &&
                            suggestions.map((suggestion, i) => {
                                return (
                                    <div
                                        key={i}
                                        className="suggestion text-start mb-1 mt-1"
                                        onClick={() =>
                                            onSuggestHandler(suggestion)
                                        }
                                    >
                                        {suggestion}
                                    </div>
                                )
                            })}
                    </div>
                    <button
                        className="btn btn-outline-secondary mt-5"
                        id="button-addon2"
                        type="submit"
                    >
                        Submit
                    </button>
                </form>
            </div>
            <div className="container-fluid mb-5 mt-5 pb-5">
                {results.length > 0 && <JsonToTable json={results} />}
                {showErr && results.length < 1 && (
                    <h1>
                        The hospital didnt provide any price information for
                        this procedure
                    </h1>
                )}
            </div>
            {/* {results.length > 0 && <Table
                selectedHospital={selectedHospital}
                text={text}
                results={results}
            />} */}
        </div>
    )
}

export default App;

//20555    92597 - Oral speech device eval