import { useCallback, useEffect, useState } from 'react'

import { exchange } from '../apollo/client'
import { liquidityPositionSubsetQuery } from '../apollo/queries'

import sushiData from '@sushiswap/sushi-data'
import _ from 'lodash'

// Todo: Rewrite in terms of web3 as opposed to subgraph
const useFarms = () => {
  const [farms, setFarms] = useState<any | undefined>()

  const fetchAllFarms = useCallback(async () => {
    const results = await Promise.all([
      sushiData.exchange.pairs(), // results[0]
      sushiData.masterchef.apys(), // results[1]
      exchange.query({
        // results[2]
        query: liquidityPositionSubsetQuery,
        variables: { user: '0xc2edad668740f1aa35e4d8f227fb8e17dca888cd' }
      })
    ])
    console.log('results:', results)
    const merged = results[1]
      ?.filter(pool => {
        // exclude dummy tokens (dont have actual pairs)
        const details = results[0]?.find(pair => pool.pair === pair.id)
        if (!details) {
          return false
        }
        return true
      })
      .map(pool => {
        const details = results[0]?.find(pair => pool.pair === pair.id)
        const liquidityPosition = results[2]?.data.liquidityPositions.find(
          (liquidityPosition: { pair: { id: string } }) => pool.pair === liquidityPosition.pair.id
        )
        //console.log('details:', details)
        return {
          ...pool,
          symbol: details?.token0?.symbol + '-' + details?.token1?.symbol,
          apy: pool.apy ? pool.apy : 0,
          tvl:
            details?.reserveUSD &&
            details?.totalSupply &&
            (details?.reserveUSD / details?.totalSupply) * liquidityPosition?.liquidityTokenBalance,
          details: {
            ...details,
            liquidityTokenBalance: liquidityPosition?.liquidityTokenBalance
          }
        }
      })
    const sorted = _.orderBy(merged, ['apy'], ['desc'])
    setFarms(sorted)
  }, [])

  useEffect(() => {
    fetchAllFarms()
  }, [fetchAllFarms])

  return farms
}

export default useFarms
