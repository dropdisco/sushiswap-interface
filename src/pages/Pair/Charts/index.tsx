import React, { useState, useEffect, useRef } from 'react'

// Components
import AreaChart from '../../../components/Chart/Area'
import BarChart from '../../../components/Chart/Bar'
import Tabs from './Tabs'

import { ResponsiveContainer } from 'recharts'
import { transparentize } from 'polished'

import { useDarkModeManager } from '../../../state/user/hooks'

import sushiData from '@sushiswap/sushi-data'

const tabs = [
  {
    title: 'Price',
    id: 'price'
  },
  {
    title: 'Liquidity (USD)',
    id: 'liquidityUSD'
  },
  {
    title: 'Liquidity (ETH)',
    id: 'liquidityETH'
  },
  {
    title: 'Volume',
    id: 'volume'
  },
  {
    title: 'Transactions',
    id: 'transactions'
  }
]

const timeTabs = [
  {
    title: 'H',
    id: 'hourly'
  },
  {
    title: 'D',
    id: 'daily'
  }
]

type ChartsBodyProps = {
  tokenAddress?: string
  pairAddress?: string
}

const Charts = ({ tokenAddress, pairAddress }: ChartsBodyProps) => {
  const [darkMode] = useDarkModeManager()
  const [section, setSection] = useState('transactions')
  const [timeFrame, setTimeFrame] = useState('daily')

  // fetch data from subgrpah
  const [data, setData] = useState<any>()
  useEffect(() => {
    const fetchData = async () => {
      if (tokenAddress && !pairAddress) {
        const daily = await sushiData.charts.tokenDaily({
          // eslint-disable-next-line @typescript-eslint/camelcase
          token_address: tokenAddress
        })
        const hourly = await sushiData.charts.tokenHourly({
          // eslint-disable-next-line @typescript-eslint/camelcase
          token_address: tokenAddress
        })
        setData({ daily: daily, hourly: hourly })
      }
      if (pairAddress && !tokenAddress) {
        const daily = await sushiData.charts.pairDaily({
          // eslint-disable-next-line @typescript-eslint/camelcase
          pair_address: pairAddress
        })
        const hourly = await sushiData.charts.pairHourly({
          // eslint-disable-next-line @typescript-eslint/camelcase
          pair_address: pairAddress
        })
        setData({ daily: daily, hourly: hourly })
      }
    }
    fetchData()
  }, [tokenAddress, pairAddress])

  console.log('tokenData:', timeFrame, data)

  // update the width on a window resize
  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(ref?.current?.clientWidth)
  useEffect(() => {
    function handleResize() {
      setWidth(ref?.current?.clientWidth ?? width)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [width]) // Empty array ensures that effect is only run on mount and unmount

  return (
    <>
      <div className="pt-4 w-full">
        <div
          className={'flex-1 flex flex-col rounded-2xl rounded-l-none overflow-hidden'}
          style={{ backgroundColor: `${darkMode ? transparentize(0.6, '#20242a') : transparentize(0.6, '#ffffff')}` }}
        >
          <div className="flex-1 pl-8 pr-6 pb-6 pt-4 flex flex-col justify-between" ref={ref}>
            <div>
              {data ? (
                <>
                  {/* {section === 'price' && (
                  <ResponsiveContainer aspect={60 / 28}>
                    <AreaChart height={330} data={data[timeFrame]} timeKey={'timestamp'} valueKey={'priceUSD'} width={width} />
                  </ResponsiveContainer>
                )} */}
                  {section === 'price' && timeFrame === 'daily' && (
                    <ResponsiveContainer aspect={60 / 26}>
                      <AreaChart
                        height={300}
                        data={data[timeFrame]}
                        timeKey={'timestamp'}
                        valueKey={'priceUSD'}
                        width={width}
                      />
                    </ResponsiveContainer>
                  )}
                  {section === 'price' && timeFrame === 'hourly' && (
                    <ResponsiveContainer aspect={60 / 26}>
                      <AreaChart
                        height={300}
                        data={data[timeFrame]}
                        timeKey={'timestamp'}
                        valueKey={'priceUSD'}
                        width={width}
                      />
                    </ResponsiveContainer>
                  )}
                  {section === 'liquidityUSD' && timeFrame === 'daily' && (
                    <ResponsiveContainer aspect={60 / 26}>
                      <AreaChart
                        height={300}
                        data={data[timeFrame]}
                        timeKey={'timestamp'}
                        valueKey={'liquidityUSD'}
                        width={width}
                      />
                    </ResponsiveContainer>
                  )}
                  {section === 'liquidityETH' && timeFrame === 'daily' && (
                    <ResponsiveContainer aspect={60 / 26}>
                      <AreaChart
                        height={300}
                        data={data[timeFrame]}
                        timeKey={'timestamp'}
                        valueKey={'liquidityETH'}
                        width={width}
                      />
                    </ResponsiveContainer>
                  )}
                  {section === 'volume' && timeFrame === 'daily' && (
                    <ResponsiveContainer aspect={60 / 26}>
                      <BarChart
                        height={300}
                        data={data[timeFrame]}
                        timeKey={'timestamp'}
                        valueKey={'volumeUSD'}
                        width={width}
                      />
                    </ResponsiveContainer>
                  )}
                  {section === 'volume' && timeFrame === 'hourly' && (
                    <ResponsiveContainer aspect={60 / 26}>
                      <BarChart
                        height={300}
                        data={data[timeFrame]}
                        timeKey={'timestamp'}
                        valueKey={'volumeUSD'}
                        width={width}
                      />
                    </ResponsiveContainer>
                  )}
                  {section === 'transactions' && timeFrame === 'daily' && (
                    <ResponsiveContainer aspect={60 / 26}>
                      <BarChart
                        height={300}
                        data={data[timeFrame]}
                        timeKey={'timestamp'}
                        valueKey={'txCount'}
                        width={width}
                      />
                    </ResponsiveContainer>
                  )}
                  {section === 'transactions' && timeFrame === 'hourly' && (
                    <ResponsiveContainer aspect={60 / 26}>
                      <BarChart
                        height={300}
                        data={data[timeFrame]}
                        timeKey={'timestamp'}
                        valueKey={'txCount'}
                        width={width}
                      />
                    </ResponsiveContainer>
                  )}
                </>
              ) : null}
            </div>
            <div className="flex justify-between">
              <Tabs tabs={tabs} selected={section} setSelected={setSection} />
              <Tabs tabs={timeTabs} selected={timeFrame} setSelected={setTimeFrame} />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Charts
