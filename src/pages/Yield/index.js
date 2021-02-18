/* eslint-disable react/prop-types */

import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

// Components
import { SwapPoolTabs } from '../../components/NavigationTabs'
import { AutoColumn } from '../../components/Column'
import DoubleLogo from './DoubleLogo'
//import TokenLogo from './TokenLogo'
import SortByDropdown from './SortBy'

// Hooks
import { useDarkModeManager } from '../../state/user/hooks'
//import { useActiveWeb3React } from '../../hooks'
import useFuse from '../../hooks/useFuse'
import useSortableData from '../../hooks/useSortableData'

// Apollo Queries
import { exchange } from '../../apollo/client'
import { liquidityPositionSubsetQuery } from '../../apollo/queries'

// Additional Libraries
import sushiData from '@sushiswap/sushi-data'
import _ from 'lodash'
import { FadeIn } from './Animations'

// Image Assets
import XSushiGlow from '../../assets/images/xsushi_glow.png'

const PageWrapper = styled(AutoColumn)`
  max-width: 640px;
  width: 100%;
`

export default function Pool() {
  //const theme = useContext(ThemeContext)
  //const { account } = useActiveWeb3React()
  const [darkMode] = useDarkModeManager()
  const [pools, setPools] = useState()

  // Query Masterchef add Pair Details, remove Dummy Pools
  useEffect(() => {
    const fetchData = async () => {
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
            liquidityPosition => pool.pair === liquidityPosition.pair.id
          )
          //console.log('details:', details)
          return {
            ...pool,
            symbol: details?.token0?.symbol + '-' + pool?.details?.token1?.symbol,
            apy: pool.apy ? pool.apy : 0,
            tvl: (details?.reserveUSD / details?.totalSupply) * liquidityPosition?.liquidityTokenBalance,
            details: {
              ...details,
              liquidityTokenBalance: liquidityPosition?.liquidityTokenBalance
            }
          }
        })
      const sorted = _.orderBy(merged, ['apy'], ['desc'])
      setPools(sorted)
    }
    fetchData()
  }, [])

  // Search Setup
  const options = { keys: ['symbol', 'name', 'pair'] }
  const { result, search, term } = useFuse({
    data: pools && pools.length > 0 ? pools : [],
    options
  })
  const flattenSearchResults = result.map(a => (a.item ? a.item : a))

  return <></>
}
