import React, { useState } from 'react'
import styled from 'styled-components'
import Tabs from './Tabs'

import Swap from '../../Swap/direct'
import Settings from '../../../components/Settings'
import AddLiquidity from '../../AddLiquidity/direct'
//import RemoveLiquidity from '../../RemoveLiquidity/direct'
import Stake from '../../Stake/direct'

import { useDarkModeManager } from '../../../state/user/hooks'

const tabs = [
  {
    title: 'Swap',
    id: 'swap'
  },
  {
    title: 'Add',
    id: 'add'
  },
  {
    title: 'Stake',
    id: 'stake'
  },
  {
    title: 'Remove',
    id: 'remove'
  }
]

type TabsBodyProps = {
  section: string
  tokenA: string
  tokenB: string
}

// eslint-disable-next-line react/prop-types
function TabsBody({ section, tokenA, tokenB }: TabsBodyProps) {
  switch (section) {
    case 'swap':
      return <Swap tokenA={tokenA} tokenB={tokenB} />
    case 'add':
      return <AddLiquidity currencyIdA={tokenA} currencyIdB={tokenB} />
    case 'stake':
      return <Stake pair={''} />
    case 'remove':
      return <AddLiquidity currencyIdA={tokenA} currencyIdB={tokenB} />
    default:
      return null
  }
}

interface PluginProps {
  initialSection?: any
  title?: any
  tokenA: any
  tokenB: any
}

export const PluginWidth = styled.div`
  width: 650px;
`

const Plugin = ({ initialSection, title, tokenA, tokenB }: PluginProps) => {
  const [darkMode] = useDarkModeManager()
  const [section, setSection] = useState(initialSection)
  return (
    <>
      <PluginWidth>
        <div
          className={'flex flex-col rounded-2xl overflow-hidden'}
          style={{ background: `${darkMode ? '#19212e' : 'bg-white'}` }}
        >
          <div className="flex-1 lg:p-6 flex flex-col justify-between" style={{ minHeight: '32.5rem' }}>
            <div className="relative space-y-4 pb-3">
              <div className="flex justify-between">
                <Tabs tabs={tabs} selected={section} setSelected={setSection} />
                <Settings />
              </div>
              <TabsBody section={section} tokenA={tokenA} tokenB={tokenB} />
            </div>
          </div>
        </div>
      </PluginWidth>
    </>
  )
}

export default Plugin
