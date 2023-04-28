const express = require("express");
const dotenv = require("dotenv");
const Binance = require("node-binance-api");
dotenv.config();
const app = express();
app.use(express.json());
const port = process.env.PORT || 8080;

const binance_api = new Binance().options({
  APIKEY: process.env.API_KEY,
  APISECRET: process.env.API_SECRET,
});

app.post("/configure", async (req, res) => {
  if (req.body.code && req.body.code == process.env.CODE) {
    try {
      const market = req.body.market;
      const marginType = req.body.marginType;
      const marginValue = req.body.marginValue;
      const res_risk = await binance_api.futuresLeverage(market, marginValue);
      console.log(res_risk);
      const res_margin = await binance_api.futuresMarginType(
        market,
        marginType
      );
      console.log(res_margin);
      res.status(200).json({
        status: "ok",
        message: `Configured margin type${marginType}, with value ${marginValue} and market ${market}`,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: "fail", message: error });
    }
  } else {
    res
      .status(404)
      .json({ status: "ok", message: "Invalid Verification Code" });
  }
});

app.post("/webhook/position", async (req, res) => {
  if (req.body.code && req.body.code == process.env.CODE) {
    try {
      console.log(req.body);
      if (req.body.action == "sell") {
        const res_sell = await binance_api.futuresMarketSell(
          "1000SHIBBUSD",
          Math.round(parseFloat(req.body.size))
        );
        console.log(res_sell);
      }
      if (req.body.action == "buy") {
        const res_buy = await binance_api.futuresMarketBuy(
          "1000SHIBBUSD",
          Math.round(parseFloat(req.body.size))
        );
        console.log(res_buy);
      }
      res.status(200).json({ status: "ok", message: "Order Placed" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: "error", message: "Fail to place order" });
    }
  } else {
    res
      .status(404)
      .json({ status: "ok", message: "Invalid Verification Code" });
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
