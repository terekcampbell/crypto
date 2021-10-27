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
      ws: {},
      first: {},
    }

    this.url = "https://api.pro.coinbase.com";
  }

  componentDidMount() {
    this.setState({ws: {current: new WebSocket("wss://ws-feed.pro.coinbase.com")}});

    // await?
    this.apiCall();
  }

  componentDidUpdate(_, prevState) {
    if (prevState.pair !== this.state.pair) {
      if (!this.first.current) {
        return;
      }
      
      let msg = {
        type: "subscribe",
        product_ids: [this.pair],
        channels: ["ticker"]
      };
      let jsonMsg = JSON.stringify(msg);
      this.ws.current.send(jsonMsg);
  
      let historicalDataURL = `${this.url}/products/${this.pair}/candles?granularity=86400`;
      const fetchHistoricalData = async () => {
        let dataArr = [];
        await fetch(historicalDataURL)
          .then((res) => res.json())
          .then((data) => (dataArr = data));
        
        let formattedData = formatData(dataArr);
        this.setState({pastData: formattedData});
      };
  
      fetchHistoricalData();
  
      this.ws.current.onmessage = (e) => {
        let data = JSON.parse(e.data);
        if (data.type !== "ticker") {
          return;
        }
  
        if (data.product_id === this.pair) {
          this.setState({price: data.price});
        }
      };  
    }

  }

  async apiCall() {
    await fetch(this.url + "/products")
      .then(res => res.json())
      .then(data => this.pairs = data);
    
    let filtered = this.pairs
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

    
    this.setState({
      currencies: filtered,
      first: {current: true}
    });
  };

  handleSelect(e) {
    let unsubMsg = {
      type: "unsubscribe",
      product_ids: [this.pair],
      channels: ["ticker"]
    };
    let unsub = JSON.stringify(unsubMsg);

    this.ws.current.send(unsub);

    this.setState({pair: e.target.value});
  }

  render() {
    return (
      <div className="container">
        {
          <select name="currency" value={this.pair} onChange={this.handleSelect}>
            {// this.currencies



            [{display_name: '1INCH/USD', id: '1INCH-USD'}].map((cur, idx) => {
              return (
                <option key={idx} value={cur.id}>
                  {cur.display_name}
                </option>
              );
            })}
          </select>
        }
        <Dashboard price={this.price} data={this.pastData} />
      </div>
    );    
  }
}
