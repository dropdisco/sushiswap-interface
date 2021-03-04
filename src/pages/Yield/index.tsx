/* eslint-disable react/prop-types */

import React from 'react'
import styled from 'styled-components'

// Components
import { SwapPoolTabs } from '../../components/NavigationTabs'
import { AutoColumn } from '../../components/Column'
import SortByDropdown from './SortBy'
import YieldItem from './YieldItem'

// Hooks
import useUserFarms from '../../sushi-hooks/useUserFarms'
import useFarms from '../../sushi-hooks/useFarmsSubgraph'
import useFuse from '../../hooks/useFuse'
import useSortableData from '../../hooks/useSortableData'

// Image Assets
import XSushiGlow from '../../assets/images/xsushi_glow.png'

const PageWrapper = styled(AutoColumn)`
  max-width: 840px;
  width: 100%;
`

export default function Pool() {
  const userFarms = useUserFarms()
  const farms = useFarms()

  // todo: this is inefficient on each rerender
  //const farmsWithUserDetails = [] as any // for logging
  const farmsWithUserDetails = farms?.map((farm: any) => {
    const userDetails = userFarms?.farms?.find((detail: any) => farm.id === detail.pid)
    if (userDetails) {
      return {
        ...farm,
        userDetails: { ...userDetails }
      }
    } else {
      return {
        ...farm
      }
    }
  })
  //console.log('farmsWithUserDetails:', farmsWithUserDetails)

  // Search Setup
  const options = { keys: ['symbol', 'name', 'pair'] }
  const { result, search, term } = useFuse({
    data: farmsWithUserDetails && farmsWithUserDetails.length > 0 ? farmsWithUserDetails : [],
    options
  })
  const flattenSearchResults = result.map((a: { item: any }) => (a.item ? a.item : a))
  //console.log('flattenSearchResults:', flattenSearchResults)

  // Sorting Setup
  const { items, requestSort, sortConfig } = useSortableData(flattenSearchResults)

  return (
    <>
      <PageWrapper>
        <SwapPoolTabs active="pool" />
        <div className="flex w-full">
          <div className={'flex flex-1'}>
            <div className="flex-1">
              <div className="flex justify-between md:w-96">
                <h1 className="text-3xl pb-2">
                  {term?.length > 0
                    ? (items && items?.length > 0 ? items?.length : '0') + ' Results Found'
                    : (farms && farms?.length > 0 ? farms?.length : '') + ' Yield Instruments'}
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
                      // console.log('Pool:', pool)
                      return (
                        <div key={pool?.id}>
                          <YieldItem pool={pool} />
                        </div>
                      )
                    })
                  : 'No Instruments Found'}
              </div>
            </div>
          </div>
        </div>
      </PageWrapper>
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
