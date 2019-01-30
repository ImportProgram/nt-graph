import React, { Component } from "react"
import ReactDom from "react-dom"
import { Layout } from "@importcore/crust"
import SearchInput, { createFilter } from 'react-search-input'
import { Line } from 'react-chartjs-2';
import * as zoom from "chartjs-plugin-zoom"


//List of all options for the ChartJS
const options =
{
    pan: {
        enabled: true,
        mode: "y",
        speed: 0.1,
        threshold: 10
    },
    zoom: {
        enabled: true,
        drag: false,
        mode: "xy",
        limits: {
            max: 10,
            min: 0.5
        }
    },
    scales: {
        xAxes: [{
            type: 'linear',
            ticks: {
                suggestedMin: 0,
                suggestedMax: 100,
                stepSize: 10
            }
        }]
    },
    showTooltips: false,
    animation: false
}


/**
 * Main Sidebar Component
 */
class Sidebar extends Component {
    constructor() {
        super()
        this.state = {
            searchTerm: ""
        }
    }
    /**
     * When the search bar us updated
     * @param {String} term 
     */
    searchUpdated(term) {
        this.setState({ searchTerm: term })
    }
    /**
     * When any of the COLOR inputs get changed
     * @param {object} event 
     * @param {String} name 
     */
    onInput(name, event) {
        if (this.props.onInput) {
            this.props.onInput(event.target.value, name)
        }
    }
    /**
     * OnChange of the Color Inputs
     * @param {String} name 
     */
    onChange(name) {
        if (this.props.onCheckboxChange) {
            this.props.onCheckboxChange(name)
        }
    }
    renderSidebar() {
        //We are using a filter because of the search option
        const KEYS_TO_FILTERS = ["name"]
        let filteredNTData = this
            .props
            .data
            .filter(createFilter(this.state.searchTerm, KEYS_TO_FILTERS))
        if (filteredNTData.length > 0) {
            return (filteredNTData.map(entry => {
                return (
                    <Layout.Grid height={50} key={entry.name} col>
                        <Layout.Grid width="100%" row>
                            <Layout.Grid width={100}><button
                                style={{ fontSize: 12, minHeight: 30, width: "100%", backgroundColor: this.props.value[entry.name].color }}
                            >{entry.name}</button></Layout.Grid>
                            <Layout.Grid col>
                                <Layout.Grid width="80%">
                                    <input type="text" value={this.props.value[entry.name].color} onInput={this.onInput.bind(this, entry.name)} style={{ width: 60, height: 30 }} />
                                </Layout.Grid>
                                <Layout.Grid width="20%"><input type="checkbox" onChange={this.onChange.bind(this, entry.name)} checked={this.props.value[entry.name].selected} style={{ width: 30, height: 24 }} /></Layout.Grid>
                            </Layout.Grid>
                        </Layout.Grid>
                    </Layout.Grid>

                )
            }))
        } else {
            //If not connected, don't show anything
            return <section
                style={{ "position": "relative", "margin": "auto", "top": "0", "right": "0", "bottom": "0", "left": "0", "borderRadius": "3px", "textAlign": "center" }}>

                <p className="label" style={{ "marginTop": "30px", "fontSize": "20px" }}>Waiting for data...</p>

            </section>
        }
    }
    render() {
        let titleStyle = { paddingTop: 0, marginTop: 0 }
        if (this.props.active) {
            titleStyle.fontWeight = "bold"
        }
        return <Layout.Grid width={200} row background="gray">
            <Layout.Grid height={70} row>
                <Layout.Grid height={20} style={{ paddingTop: 0, textAlign: "center" }}><p style={titleStyle}>{this.props.title}</p></Layout.Grid>
                <Layout.Grid> <SearchInput
                    style={{ "width": "100%", "height": "40px" }}
                    className="search-input"

                    onChange={this
                        .searchUpdated
                        .bind(this)} /></Layout.Grid>
            </Layout.Grid>
            <Layout.Grid row>{this.renderSidebar()}</Layout.Grid>
        </Layout.Grid>
    }
}
/**
 * Main App Renderer
 */
class App extends Component {
    constructor() {
        super()
        this.state = {
            playbackTime: 34333,
            playbackValue: 1,
            ntValues: {},
            ntKeys: [],
            ntOptions: {},
            ntLiveData: {},
            chartData: { datasets: [] }
        }
    }
    /**
     * When the COLOR of a NT Key is changed
     * @param {Hex} value 
     * @param {String} name 
     */
    onLiveColorChange(value, name) {
        let ntOptions = this.state.ntOptions
        if (ntOptions[name] != null) {
            ntOptions[name].color = value
            //Update it
            this.setState({ ntOptions })
        }
    }
    /**
     * When the button press for an object on the sidebar is pressed
     * @param {String} name 
     */
    onLiveChecked(name) {
        let ntOptions = this.state.ntOptions
        if (ntOptions[name] != null) {
            //Toggle it
            if (ntOptions[name].selected == false) {
                ntOptions[name].selected = true
            } else {
                ntOptions[name].selected = false
            }
            //Update it
            this.setState({ ntOptions })
        }
    }
    componentDidMount() {
        let onNetworkTablesConnection = () => { }
        let onRobotConnection = () => { }
        //Check if the value has changed
        let onValueChanged = (key, value, isNew) => {

            //Grab all the NT values
            let ntValues = this.state.ntValues
            let ntKeys = this.state.ntKeys
            let ntOptions = this.state.ntOptions

            //Update the value if needed
            ntValues[key] = value

            //Also make the options for the sidebar shown here too
            if (isNew) {
                //Only add it one to the array (this is because the search for the sidebar require it)
                ntKeys.push({ name: key })
                ntOptions[key] = {} //Make an object and generate a random color for it. NOTICE: The color genration can be intenseive will a lot of NT data points in Network Tables
                ntOptions[key].color = '#' + Math.floor(Math.random() * 16777215).toString(16);
                ntOptions[key].selected = false
            }


            //Update the values to the state of this component
            this.setState({ ntValues, ntKeys, ntOptions })


        }
        NetworkTables.addWsConnectionListener(onNetworkTablesConnection, true);
        // sets a function that will be called when the robot connects/disconnects
        NetworkTables.addRobotConnectionListener(onRobotConnection, true);
        // sets a function that will be called when any NetworkTables key/value changes
        NetworkTables.addGlobalListener(onValueChanged, true);
       
        console.log("%cnt-graph%c - %cImportProgram", "font-size: 24px; background: gray;  border-radius: 4px;","background: white; font-size: 24px", "background: orange; font-size: 24px; border-radius: 4px;")
        console.log("%cGithub - http://github.com/ImportProgram", "font-size: 16px")


        //The runtime (checks every 100ms)
        setInterval(() => {

            let ntLiveData = this.state.ntLiveData //Make a local variable of the data
            let ntDataset = {}
            //Check for all VALUES in the network tables instance
            for (let key in this.state.ntValues) {
                if (this.state.ntOptions[key].selected) { //Are they selected?
                    let color = this.state.ntOptions[key].color //Grab the color
                    if (ntLiveData[key] == null) { //Check if this is the first time of selection
                        console.log("is null") //If so it should be null
                        ntLiveData[key] = [] //Make the array of points
                        for (let i = 0; i < 1000; i++) { //Generate a fake 1000 points
                            ntLiveData[key].push(0) //Push it all
                        }
                    }
                    else {
                        //If the array is already created (meaing it already has 1000 points)
                        //Lets remove the last point on the graph so we can add new ones
                        ntLiveData[key].shift()
                    }
                    //Lets also create the graph visuals, color & title
                    //Each "selected" is a new dataset
                    ntDataset[key] = {
                        label: key,
                        fill: false,
                        lineTension: 0.1,
                        backgroundColor: color,
                        borderColor: color,
                        borderCapStyle: 'butt',
                        borderDash: [],
                        borderDashOffset: 0.0,
                        borderJoinStyle: 'miter',
                        pointBorderColor: color,
                        pointBackgroundColor: '#fff',
                        pointBorderWidth: 1,
                        pointHoverRadius: 5,
                        pointHoverBackgroundColor: color,
                        pointHoverBorderColor: color,
                        pointHoverBorderWidth: 2,
                        pointRadius: 1,
                        pointHitRadius: 10,
                        data: []
                    }

                    //Add that dataset to the live data array
                    ntLiveData[key].push(this.state.ntValues[key])

                    //Now lets render the points
                    let ntLiveDataModified = []
                    let lastPoint = null

                    //Lets go through all the 1000 points in the LivData array
                    for (let x in ntLiveData[key]) {
                        //Lets get the Y and X values
                        let y = ntLiveData[key][x]
                        //Lets check if the last X value is 0 (end of the graph)
                        //This is ALWAYS rendered because if issues with the graph
                        if (x == 0) {
                            ntLiveDataModified.push({ x, y })
                        } else {
                            //If not lets check if the point before the last point is the same
                            //If there ARE NOT the same point, add that point. This is done
                            //Because there is no point of rendering 1000 points at once,
                            //Only render the points on the screen where a "change" has occured
                            if (lastPoint != null && lastPoint != y) {
                                ntLiveDataModified.push({ x, y })
                            }
                            //Though always render the first point of the graph
                            if (ntLiveData[key].length - 1 == x) { //The One on the array
                                ntLiveDataModified.push({ x, y })
                            }
                        }

                        //Save the last "value" of the last point
                        lastPoint = y
                    }
                    //Add all this data to the datasets
                    ntDataset[key].data = ntLiveDataModified
                }
            }
            //Now lets loop through al of the datasets
            let chartData = {}
            chartData.datasets = []
            for (let key in ntDataset) {
                //Add each dataset to the data of the chart
                chartData.datasets.push(ntDataset[key])
            }
            //And now set the state, which updates the chart visuals and the 1000 points (ntLiveData)
            this.setState({ chartData, ntLiveData })

        }, 100)
    }
    //Render it
    render() {
        return <Layout.Grid canvas>
            <Sidebar title="Live NT" data={this.state.ntKeys} value={this.state.ntOptions} onInput={this.onLiveColorChange.bind(this)} onCheckboxChange={this.onLiveChecked.bind(this)} />
            <Layout.Grid row>
                <Layout.Grid row>
                    <Layout.Grid> <Line data={this.state.chartData} options={options} /></Layout.Grid>
                </Layout.Grid>
            </Layout.Grid>
        </Layout.Grid>
    }
}
ReactDom.render(<App />, document.querySelector("#app"))