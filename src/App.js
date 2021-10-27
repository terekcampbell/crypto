import React, { useState, useEffect, useRef, Component } from "react";
import Dashboard from "./components/Dashboard";
import { formatData } from "./utils";
import "./styles.css";

export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currencies: [],
      pair: "",
      pairs: [],
      price: "0.00",
      pastData: {},
    }

    this.url = "https://api.pro.coinbase.com";
    this.ws = new WebSocket("wss://ws-feed.pro.coinbase.com");
  }

  async componentDidMount() {
    await fetch(this.url + "/products")
      .then(res => res.json())
      .then(data => this.state.pairs = data);
    
    let filtered = this.state.pairs
      .filter(pair => pair.quote_currency === "USD")
      .sort((a, b) => {
        if (a.base_currency < b.base_currency) {
          return -1;
        }
        if (a.base_currency > b.base_currency) {
          return 1;
        }
        return 0;
      });

    this.setState({currencies: filtered});
  }

  componentDidUpdate(_, prevState) {
    if (prevState.pair !== this.state.pair) {
      let msg = {
        type: "subscribe",
        product_ids: [this.state.pair],
        channels: ["ticker"]
      };
      let jsonMsg = JSON.stringify(msg);
      this.ws.send(jsonMsg);
  
      this.fetchHistoricalData();
  
      this.ws.onmessage = e => {
        let data = JSON.parse(e.data);
        if (data.type !== "ticker") {
          return;
        }
  
        if (data.product_id === this.state.pair) {
          this.setState({price: data.price});
        }
      };  
    }
  }

  handleSelect = e => {
    let unsubMsg = {
      type: "unsubscribe",
      product_ids: [this.state.pair],
      channels: ["ticker"]
    };
    let unsub = JSON.stringify(unsubMsg);

    this.ws.send(unsub);

    this.setState({pair: e.target.value});
  }
      
  fetchHistoricalData = async () => {
    let dataArr = [];
    let historicalDataURL = `${this.url}/products/${this.state.pair}/candles?granularity=86400`;
    await fetch(historicalDataURL)
      .then(res => res.json())
      .then(data => (dataArr = data));
    
    let formattedData = formatData(dataArr);
    this.setState({pastData: formattedData});
  }

render() {
    return (
      <div className="container">
        {
          <select name="currency" value={this.state.pair} onChange={this.handleSelect}>
            {this.state.currencies.map((cur, idx) => {
              return (
                <option key={idx} value={cur.id}>
                  {cur.display_name}
                </option>
              );
            })}
          </select>
        }
        <Dashboard price={this.state.price} data={this.state.pastData} />
      </div>
    );    
  }
}
