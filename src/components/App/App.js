import React, { Component } from "react";
import './App.css';
import axios from 'axios';

export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      cryptos: [],
      currencies: [],
      pair: "",
      price: "0.00",
      pastData: {},
      url: "https://api.pro.coinbase.com"
    };
  }

  componentDidMount() {
    axios.get("https://min-api.cryptocompare.com/data/pricemulti?fsyms=BTC,ETH,IOT&tsyms=USD")
      .then(res => {
        const cryptos = res.data;
        this.setState({cryptos: cryptos});
      })
  }

  componentDidUpdate() {
  }

  render() {
    return (
      <div>
        {/* <ChildComponent websocket={this.state.ws} />; */}
        <div className="App">
          {Object.keys(this.state.cryptos).map(key => (
            <div id="crypto-container">
              <span className="left">{key}</span>
              <span className="right">{this.state.cryptos[key].USD}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }
}
