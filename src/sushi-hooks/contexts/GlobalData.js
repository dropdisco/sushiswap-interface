import React, { createContext, useContext, useCallback, useState, useEffect, useMemo } from "react";
import sushiData from "@sushiswap/sushi-data";

import { client } from "../../apollo/client";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { GLOBAL_CHART } from "../../apollo/queries";
import weekOfYear from "dayjs/plugin/weekOfYear";
// format dayjs with the libraries that we need
dayjs.extend(utc);
dayjs.extend(weekOfYear);

export const GlobalDataContext = createContext();

function useGlobalDataContext() {
  return useContext(GlobalDataContext);
}

export const GlobalDataContextProvider = ({ children }) => {
  const [globalData, setGlobalData] = useState();

  const fetchData = useCallback(async () => {
    const results = await Promise.all([
      sushiData.exchange.tokens(),
      sushiData.exchange.pairs(),
      sushiData.masterchef.apys(), //sushiData.masterchef.pools(),
    ]);
    console.log("Global Results:", results);
    setGlobalData({ tokens: results[0], pairs: results[1], pools: results[2] });
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  return <GlobalDataContext.Provider value={useMemo(() => [globalData])}>{children}</GlobalDataContext.Provider>;
};

export function useTokens() {
  const [globalData] = useGlobalDataContext();
  let tokens = globalData?.tokens;

  return tokens || [];
}

export function usePairs() {
  const [globalData] = useGlobalDataContext();
  let pairs = globalData?.pairs;

  return pairs || [];
}

export function usePools() {
  const [globalData] = useGlobalDataContext();
  let pools = globalData?.pools;

  return pools || [];
}

export function getTimeframe(timeWindow) {
  const utcEndTime = dayjs.utc();
  // based on window, get starttime
  let utcStartTime;
  switch (timeWindow) {
    case "week":
      utcStartTime =
        utcEndTime
          .subtract(1, "week")
          .endOf("day")
          .unix() - 1;
      break;
    case "month":
      utcStartTime =
        utcEndTime
          .subtract(1, "month")
          .endOf("day")
          .unix() - 1;
      break;
    case "year":
      utcStartTime =
        utcEndTime
          .subtract(1, "year")
          .endOf("day")
          .unix() - 1;
      break;
    default:
      utcStartTime =
        utcEndTime
          .subtract(1, "year")
          .startOf("year")
          .unix() - 1;
      break;
  }
  return utcStartTime;
}

/**
 * Hook that fetches overview data, plus all tokens and pairs for search
 */
export function useGlobalData() {
  useEffect(() => {
    async function fetchData() {
      // let globalData = await getGlobalData(ethPrice, oldEthPrice);
      // globalData && update(globalData);
      // let allPairs = await getAllPairsOnUniswap();
      // updateAllPairsInUniswap(allPairs);
      // let allTokens = await getAllTokensOnUniswap();
      // updateAllTokensInUniswap(allTokens);
    }
    fetchData();
  }, []);

  return {};
}

export function useGlobalChartData(unit) {
  const timeframe = getTimeframe(unit);
  const [data, setData] = useState();
  useEffect(() => {
    async function fetchData() {
      let [newChartData, newWeeklyData] = await getChartData(timeframe);
      setData([newChartData, newWeeklyData]);
    }
    if (timeframe && !data) {
      fetchData();
    }
  }, [timeframe]);
  return data;
}

export function useEthPrice() {
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
      setData([ethPrice, ethPriceOld]);
    };
    fetchData();
  }, []);

  return data;
}

/**
 * Get historical data for volume and liquidity used in global charts
 * on main page
 * @param {*} oldestDateToFetch // start of window to fetch from
 */
export const getChartData = async (oldestDateToFetch) => {
  let data = [];
  let weeklyData = [];
  const utcEndTime = dayjs.utc();
  let skip = 0;
  let allFound = false;

  try {
    while (!allFound) {
      let result = await client.query({
        query: GLOBAL_CHART,
        variables: {
          startTime: oldestDateToFetch,
          skip,
        },
        fetchPolicy: "cache-first",
      });
      skip += 1000;
      data = data.concat(result.data.uniswapDayDatas);
      if (result.data.uniswapDayDatas.length < 1000) {
        allFound = true;
      }
    }

    if (data) {
      let dayIndexSet = new Set();
      let dayIndexArray = [];
      const oneDay = 24 * 60 * 60;

      // for each day, parse the daily volume and format for chart array
      data.forEach((dayData, i) => {
        // add the day index to the set of days
        dayIndexSet.add((data[i].date / oneDay).toFixed(0));
        dayIndexArray.push(data[i]);
        dayData.dailyVolumeUSD = parseFloat(dayData.dailyVolumeUSD);
      });

      // fill in empty days ( there will be no day datas if no trades made that day )
      let timestamp = data[0].date ? data[0].date : oldestDateToFetch;
      let latestLiquidityUSD = data[0].totalLiquidityUSD;
      let latestDayDats = data[0].mostLiquidTokens;
      let index = 1;
      while (timestamp < utcEndTime.unix() - oneDay) {
        const nextDay = timestamp + oneDay;
        let currentDayIndex = (nextDay / oneDay).toFixed(0);
        if (!dayIndexSet.has(currentDayIndex)) {
          data.push({
            date: nextDay,
            dailyVolumeUSD: 0,
            totalLiquidityUSD: latestLiquidityUSD,
            mostLiquidTokens: latestDayDats,
          });
        } else {
          latestLiquidityUSD = dayIndexArray[index].totalLiquidityUSD;
          latestDayDats = dayIndexArray[index].mostLiquidTokens;
          index = index + 1;
        }
        timestamp = nextDay;
      }
    }

    // format weekly data for weekly sized chunks
    data = data.sort((a, b) => (parseInt(a.date) > parseInt(b.date) ? 1 : -1));
    let startIndexWeekly = -1;
    let currentWeek = -1;
    data.forEach((entry, i) => {
      const week = dayjs.utc(dayjs.unix(data[i].date)).week();
      if (week !== currentWeek) {
        currentWeek = week;
        startIndexWeekly++;
      }
      weeklyData[startIndexWeekly] = weeklyData[startIndexWeekly] || {};
      weeklyData[startIndexWeekly].date = data[i].date;
      weeklyData[startIndexWeekly].weeklyVolumeUSD =
        (weeklyData[startIndexWeekly].weeklyVolumeUSD ?? 0) + data[i].dailyVolumeUSD;
    });
  } catch (e) {
    console.log(e);
  }
  return [data, weeklyData];
};

// /**
//  * Get and format transactions for global page
//  */
// export const getGlobalTransactions = async () => {
//   let transactions = {};

//   try {
//     let result = await client.query({
//       query: GLOBAL_TXNS,
//       fetchPolicy: "cache-first",
//     });
//     transactions.mints = [];
//     transactions.burns = [];
//     transactions.swaps = [];
//     result?.data?.transactions &&
//       result.data.transactions.map((transaction) => {
//         if (transaction.mints.length > 0) {
//           transaction.mints.map((mint) => {
//             return transactions.mints.push(mint);
//           });
//         }
//         if (transaction.burns.length > 0) {
//           transaction.burns.map((burn) => {
//             return transactions.burns.push(burn);
//           });
//         }
//         if (transaction.swaps.length > 0) {
//           transaction.swaps.map((swap) => {
//             return transactions.swaps.push(swap);
//           });
//         }
//         return true;
//       });
//   } catch (e) {
//     console.log(e);
//   }

//   return transactions;
// };
