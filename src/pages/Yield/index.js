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

  // Sorting Setup
  const { items, requestSort, sortConfig } = useSortableData(flattenSearchResults)
  const getClassNamesFor = name => {
    if (!sortConfig) {
      return
    }
    return sortConfig.key === name ? sortConfig.direction : undefined
  }

  // Logging
  console.log('term:', term)
  console.log('pools___:', pools)

  return (
    <>
      <PageWrapper>
        <SwapPoolTabs active={'pool'} />
        <>
          <div className="flex justify-between">
            <h1 className="text-3xl pb-2">
              {term?.length > 0
                ? (items && items?.length > 0 ? items?.length : '0') + ' Results Found'
                : (pools && pools?.length > 0 ? pools?.length : '') + ' Yield Instruments'}
            </h1>
          </div>
          <div className="py-2 flex justify-between">
            <input
              className="py-2 bg-transparent w-full focus:outline-none"
              onChange={e => search(e.target.value)}
              value={term}
              placeholder="Search for an instrument..."
            />
            <SortByDropdown requestSort={requestSort} sortConfigKey={sortConfig?.key} />
          </div>
          <div className="grid grid-cols-1 gap-4">
            <SushiBar />
            {items && items.length > 0
              ? items.map(pool => {
                  return (
                    <div key={pool?.id}>
                      <FadeIn>
                        <YieldItem darkMode={darkMode} pool={pool} />
                      </FadeIn>
                    </div>
                  )
                })
              : 'No Instruments Found'}
          </div>
        </>
      </PageWrapper>
    </>
  )
}

const YieldItem = ({ darkMode, pool }) => {
  return (
    <>
      <div
        className={
          'relative rounded-lg border px-6 py-5 shadow-sm flex items-center space-x-6 ' +
          (darkMode ? 'border-gray-600' : 'border-gray-300')
        }
      >
        <div className="flex-shrink-0">
          <DoubleLogo a0={pool?.details?.token0?.id} a1={pool?.details?.token1?.id} size={26} margin={10} />
        </div>
        <div className="flex flex-1 justify-between min-w-0">
          <button className="focus:outline-none text-left">
            <span className="absolute inset-0" aria-hidden="true" />
            <p className="text-sm font-medium">{pool?.details?.token0?.symbol + '-' + pool?.details?.token1?.symbol}</p>
            <p className="text-sm truncate">${Number(pool?.tvl).toFixed(2)}</p>
          </button>
          <div className="text-lg">{Number(pool?.apy).toFixed(3)}%</div>
        </div>
      </div>
    </>
  )
}

const SushiBar = () => {
  return (
    <>
      <div className={'relative rounded-lg border px-6 py-5 shadow-sm flex items-center space-x-6 border-yellow-400'}>
        <div className="flex-shrink-0">
          <img className="w-12 h-12" src={XSushiGlow} />
        </div>
        <div className="flex flex-1 justify-between min-w-0">
          <button className="focus:outline-none text-left">
            <span className="absolute inset-0" aria-hidden="true" />
            <p className="text-sm font-medium">xSUSHI</p>
            <p className="text-sm truncate">$20,000,000</p>
          </button>
          <div className="text-lg">15%</div>
        </div>
      </div>
    </>
  )
}
