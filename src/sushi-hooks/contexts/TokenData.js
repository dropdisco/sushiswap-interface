import React, { useState, useEffect } from "react";
import { client } from "../../apollo/client";
import {
  TOKEN_DATA,
  FILTERED_TRANSACTIONS,
  TOKEN_CHART,
  TOKENS_CURRENT,
  TOKENS_DYNAMIC,
  PRICES_BY_BLOCK,
} from "../../apollo/queries";

import sushiData from "@sushiswap/sushi-data";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

import {
  get2DayPercentChange,
  getPercentChange,
  getBlockFromTimestamp,
  getBlocksFromTimestamps,
  splitQuery,
} from "../../utils";

dayjs.extend(utc);

export function useTokenData(tokenAddress) {
  const utcCurrentTime = dayjs();
  const utcOneDayBack = utcCurrentTime
    .subtract(1, "day")
    .startOf("minute")
    .unix();

  const [data, setData] = useState();

  useEffect(() => {
    const fetchData = async () => {
      const ethPrice = await sushiData.exchange.ethPrice({});
      const ethPriceOld = await sushiData.exchange.ethPrice({ timestamp: utcOneDayBack });
      const tokenData = await getTokenData(tokenAddress, ethPrice, ethPriceOld);
      setData(tokenData);
    };
    fetchData();
  }, [tokenAddress]);

  return data || {};
}

export function useAllTokenData(tokenAddress) {
  const utcCurrentTime = dayjs();
  const utcOneDayBack = utcCurrentTime
    .subtract(1, "day")
    .startOf("minute")
    .unix();

  const [data, setData] = useState();

  useEffect(() => {
    const fetchData = async () => {
      const ethPrice = await sushiData.exchange.ethPrice({});
      const ethPriceOld = await sushiData.exchange.ethPrice({ timestamp: utcOneDayBack });
      const allTokenData = await getTopTokens(ethPrice, ethPriceOld);
      setData(allTokenData);
    };
    fetchData();
  }, [tokenAddress]);

  return data || {};
}

export const getTopTokens = async (ethPrice, ethPriceOld) => {
  const utcCurrentTime = dayjs();
  const utcOneDayBack = utcCurrentTime.subtract(1, "day").unix();
  const utcTwoDaysBack = utcCurrentTime.subtract(2, "day").unix();
  let oneDayBlock = await getBlockFromTimestamp(utcOneDayBack);
  let twoDayBlock = await getBlockFromTimestamp(utcTwoDaysBack);

  try {
    let current = await client.query({
      query: TOKENS_CURRENT,
      fetchPolicy: "cache-first",
    });

    let oneDayResult = await client.query({
      query: TOKENS_DYNAMIC(oneDayBlock),
      fetchPolicy: "cache-first",
    });

    let twoDayResult = await client.query({
      query: TOKENS_DYNAMIC(twoDayBlock),
      fetchPolicy: "cache-first",
    });

    let oneDayData = oneDayResult?.data?.tokens.reduce((obj, cur, i) => {
      return { ...obj, [cur.id]: cur };
    }, {});

    let twoDayData = twoDayResult?.data?.tokens.reduce((obj, cur, i) => {
      return { ...obj, [cur.id]: cur };
    }, {});

    let bulkResults = await Promise.all(
      current &&
        oneDayData &&
        twoDayData &&
        current?.data?.tokens.map(async (token) => {
          let data = token;

          // let liquidityDataThisToken = liquidityData?.[token.id]
          let oneDayHistory = oneDayData?.[token.id];
          let twoDayHistory = twoDayData?.[token.id];

          // catch the case where token wasnt in top list in previous days
          if (!oneDayHistory) {
            let oneDayResult = await client.query({
              query: TOKEN_DATA(token.id, oneDayBlock),
              fetchPolicy: "cache-first",
            });
            oneDayHistory = oneDayResult.data.tokens[0];
          }
          if (!twoDayHistory) {
            let twoDayResult = await client.query({
              query: TOKEN_DATA(token.id, twoDayBlock),
              fetchPolicy: "cache-first",
            });
            twoDayHistory = twoDayResult.data.tokens[0];
          }

          // calculate percentage changes and daily changes
          const [oneDayVolumeUSD, volumeChangeUSD] = get2DayPercentChange(
            data.tradeVolumeUSD,
            oneDayHistory?.tradeVolumeUSD ?? 0,
            twoDayHistory?.tradeVolumeUSD ?? 0
          );
          const [oneDayTxns, txnChange] = get2DayPercentChange(
            data.txCount,
            oneDayHistory?.txCount ?? 0,
            twoDayHistory?.txCount ?? 0
          );

          const currentLiquidityUSD = data?.totalLiquidity * ethPrice * data?.derivedETH;
          const oldLiquidityUSD = oneDayHistory?.totalLiquidity * ethPriceOld * oneDayHistory?.derivedETH;

          // percent changes
          const priceChangeUSD = getPercentChange(
            data?.derivedETH * ethPrice,
            oneDayHistory?.derivedETH ? oneDayHistory?.derivedETH * ethPriceOld : 0
          );

          // set data
          data.priceUSD = data?.derivedETH * ethPrice;
          data.totalLiquidityUSD = currentLiquidityUSD;
          data.oneDayVolumeUSD = parseFloat(oneDayVolumeUSD);
          data.volumeChangeUSD = volumeChangeUSD;
          data.priceChangeUSD = priceChangeUSD;
          data.liquidityChangeUSD = getPercentChange(currentLiquidityUSD ?? 0, oldLiquidityUSD ?? 0);
          data.oneDayTxns = oneDayTxns;
          data.txnChange = txnChange;

          // new tokens
          if (!oneDayHistory && data) {
            data.oneDayVolumeUSD = data.tradeVolumeUSD;
            data.oneDayVolumeETH = data.tradeVolume * data.derivedETH;
            data.oneDayTxns = data.txCount;
          }

          if (data.id === "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2") {
            data.name = "Ether (Wrapped)";
            data.symbol = "ETH";
          }
          return data;
        })
    );

    return bulkResults;

    // calculate percentage changes and daily changes
  } catch (e) {
    console.log(e);
  }
};

export const getTokenData = async (address, ethPrice, ethPriceOld) => {
  const utcCurrentTime = dayjs();
  const utcOneDayBack = utcCurrentTime
    .subtract(1, "day")
    .startOf("minute")
    .unix();
  const utcTwoDaysBack = utcCurrentTime
    .subtract(2, "day")
    .startOf("minute")
    .unix();
  let oneDayBlock = await getBlockFromTimestamp(utcOneDayBack);
  let twoDayBlock = await getBlockFromTimestamp(utcTwoDaysBack);

  // initialize data arrays
  let data = {};
  let oneDayData = {};
  let twoDayData = {};

  try {
    // fetch all current and historical data
    let result = await client.query({
      query: TOKEN_DATA(address),
      fetchPolicy: "cache-first",
    });
    data = result?.data?.tokens?.[0];

    // get results from 24 hours in past
    let oneDayResult = await client.query({
      query: TOKEN_DATA(address, oneDayBlock),
      fetchPolicy: "cache-first",
    });
    oneDayData = oneDayResult.data.tokens[0];

    // get results from 48 hours in past
    let twoDayResult = await client.query({
      query: TOKEN_DATA(address, twoDayBlock),
      fetchPolicy: "cache-first",
    });
    twoDayData = twoDayResult.data.tokens[0];

    // catch the case where token wasnt in top list in previous days
    if (!oneDayData) {
      let oneDayResult = await client.query({
        query: TOKEN_DATA(address, oneDayBlock),
        fetchPolicy: "cache-first",
      });
      oneDayData = oneDayResult.data.tokens[0];
    }
    if (!twoDayData) {
      let twoDayResult = await client.query({
        query: TOKEN_DATA(address, twoDayBlock),
        fetchPolicy: "cache-first",
      });
      twoDayData = twoDayResult.data.tokens[0];
    }

    // calculate percentage changes and daily changes
    const [oneDayVolumeUSD, volumeChangeUSD] = get2DayPercentChange(
      data.tradeVolumeUSD,
      oneDayData?.tradeVolumeUSD ?? 0,
      twoDayData?.tradeVolumeUSD ?? 0
    );

    // calculate percentage changes and daily changes
    const [oneDayVolumeUT, volumeChangeUT] = get2DayPercentChange(
      data.untrackedVolumeUSD,
      oneDayData?.untrackedVolumeUSD ?? 0,
      twoDayData?.untrackedVolumeUSD ?? 0
    );

    // calculate percentage changes and daily changes
    const [oneDayTxns, txnChange] = get2DayPercentChange(
      data.txCount,
      oneDayData?.txCount ?? 0,
      twoDayData?.txCount ?? 0
    );

    const priceChangeUSD = getPercentChange(
      data?.derivedETH * ethPrice,
      parseFloat(oneDayData?.derivedETH ?? 0) * ethPriceOld
    );

    const currentLiquidityUSD = data?.totalLiquidity * ethPrice * data?.derivedETH;
    const oldLiquidityUSD = oneDayData?.totalLiquidity * ethPriceOld * oneDayData?.derivedETH;

    // set data
    data.priceUSD = data?.derivedETH * ethPrice;
    data.totalLiquidityUSD = currentLiquidityUSD;
    data.oneDayVolumeUSD = oneDayVolumeUSD;
    data.volumeChangeUSD = volumeChangeUSD;
    data.priceChangeUSD = priceChangeUSD;
    data.oneDayVolumeUT = oneDayVolumeUT;
    data.volumeChangeUT = volumeChangeUT;
    const liquidityChangeUSD = getPercentChange(currentLiquidityUSD ?? 0, oldLiquidityUSD ?? 0);
    data.liquidityChangeUSD = liquidityChangeUSD;
    data.oneDayTxns = oneDayTxns;
    data.txnChange = txnChange;

    // new tokens
    if (!oneDayData && data) {
      data.oneDayVolumeUSD = data.tradeVolumeUSD;
      data.oneDayVolumeETH = data.tradeVolume * data.derivedETH;
      data.oneDayTxns = data.txCount;
    }

    // fix for WETH
    if (data.id === "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2") {
      data.name = "ETH (Wrapped)";
      data.symbol = "ETH";
    }
  } catch (e) {
    console.log(e);
  }
  return data;
};

export const getTokenTransactions = async (allPairsFormatted) => {
  const transactions = {};
  try {
    let result = await client.query({
      query: FILTERED_TRANSACTIONS,
      variables: {
        allPairs: allPairsFormatted,
      },
      fetchPolicy: "cache-first",
    });
    transactions.mints = result.data.mints;
    transactions.burns = result.data.burns;
    transactions.swaps = result.data.swaps;
  } catch (e) {
    console.log(e);
  }
  return transactions;
};

export const getTokenPairs = async (tokenAddress) => {
  try {
    // fetch all current and historical data
    let result = await client.query({
      query: TOKEN_DATA(tokenAddress),
      fetchPolicy: "cache-first",
    });
    return result.data?.["pairs0"].concat(result.data?.["pairs1"]);
  } catch (e) {
    console.log(e);
  }
};

export const getIntervalTokenData = async (tokenAddress, startTime, interval = 3600, latestBlock) => {
  const utcEndTime = dayjs.utc();
  let time = startTime;

  // create an array of hour start times until we reach current hour
  // buffer by half hour to catch case where graph isnt synced to latest block
  const timestamps = [];
  while (time < utcEndTime.unix()) {
    timestamps.push(time);
    time += interval;
  }

  // backout if invalid timestamp format
  if (timestamps.length === 0) {
    return [];
  }

  // once you have all the timestamps, get the blocks for each timestamp in a bulk query
  let blocks;
  try {
    blocks = await getBlocksFromTimestamps(timestamps, 100);

    // catch failing case
    if (!blocks || blocks.length === 0) {
      return [];
    }

    if (latestBlock) {
      blocks = blocks.filter((b) => {
        return parseFloat(b.number) <= parseFloat(latestBlock);
      });
    }

    let result = await splitQuery(PRICES_BY_BLOCK, client, [tokenAddress], blocks, 50);

    // format token ETH price results
    let values = [];
    for (var row in result) {
      let timestamp = row.split("t")[1];
      let derivedETH = parseFloat(result[row]?.derivedETH);
      if (timestamp) {
        values.push({
          timestamp,
          derivedETH,
        });
      }
    }

    // go through eth usd prices and assign to original values array
    let index = 0;
    for (var brow in result) {
      let timestamp = brow.split("b")[1];
      if (timestamp) {
        values[index].priceUSD = result[brow].ethPrice * values[index].derivedETH;
        index += 1;
      }
    }

    let formattedHistory = [];

    // for each hour, construct the open and close price
    for (let i = 0; i < values.length - 1; i++) {
      formattedHistory.push({
        timestamp: values[i].timestamp,
        open: parseFloat(values[i].priceUSD),
        close: parseFloat(values[i + 1].priceUSD),
      });
    }

    return formattedHistory;
  } catch (e) {
    console.log(e);
    console.log("error fetching blocks");
    return [];
  }
};

export const getTokenChartData = async (tokenAddress) => {
  let data = [];
  const utcEndTime = dayjs.utc();
  let utcStartTime = utcEndTime.subtract(1, "year");
  let startTime = utcStartTime.startOf("minute").unix() - 1;

  try {
    let allFound = false;
    let skip = 0;
    while (!allFound) {
      let result = await client.query({
        query: TOKEN_CHART,
        variables: {
          tokenAddr: tokenAddress,
          skip,
        },
        fetchPolicy: "cache-first",
      });
      if (result.data.tokenDayDatas.length < 1000) {
        allFound = true;
      }
      skip += 1000;
      data = data.concat(result.data.tokenDayDatas);
    }

    let dayIndexSet = new Set();
    let dayIndexArray = [];
    const oneDay = 24 * 60 * 60;
    data.forEach((dayData, i) => {
      // add the day index to the set of days
      dayIndexSet.add((data[i].date / oneDay).toFixed(0));
      dayIndexArray.push(data[i]);
      dayData.dailyVolumeUSD = parseFloat(dayData.dailyVolumeUSD);
    });

    // fill in empty days
    let timestamp = data[0] && data[0].date ? data[0].date : startTime;
    let latestLiquidityUSD = data[0] && data[0].totalLiquidityUSD;
    let latestPriceUSD = data[0] && data[0].priceUSD;
    let latestPairDatas = data[0] && data[0].mostLiquidPairs;
    let index = 1;
    while (timestamp < utcEndTime.startOf("minute").unix() - oneDay) {
      const nextDay = timestamp + oneDay;
      let currentDayIndex = (nextDay / oneDay).toFixed(0);
      if (!dayIndexSet.has(currentDayIndex)) {
        data.push({
          date: nextDay,
          dayString: nextDay,
          dailyVolumeUSD: 0,
          priceUSD: latestPriceUSD,
          totalLiquidityUSD: latestLiquidityUSD,
          mostLiquidPairs: latestPairDatas,
        });
      } else {
        latestLiquidityUSD = dayIndexArray[index].totalLiquidityUSD;
        latestPriceUSD = dayIndexArray[index].priceUSD;
        latestPairDatas = dayIndexArray[index].mostLiquidPairs;
        index = index + 1;
      }
      timestamp = nextDay;
    }
    data = data.sort((a, b) => (parseInt(a.date) > parseInt(b.date) ? 1 : -1));
  } catch (e) {
    console.log(e);
  }
  return data;
};
