import React from 'react'

import { useDarkModeManager } from '../../state/user/hooks'
import DoubleLogo from './DoubleLogo'

interface YieldItemProps {
  darkMode?: any
  pool: any
  onPoolClick?: any
  selectedPool?: any
}

const YieldItem = ({ darkMode, pool, onPoolClick, selectedPool }: YieldItemProps) => {
  const isSelected = selectedPool == pool.id
  return (
    <>
      <div
        className={
          'relative rounded-lg border px-6 py-5 shadow-sm flex items-center space-x-6 ' +
          (darkMode
            ? isSelected
              ? 'border-gray-400'
              : 'border-gray-600'
            : isSelected
            ? 'border-gray-500'
            : 'border-gray-300')
        }
      >
        <div className="flex-shrink-0">
          <DoubleLogo a0={pool?.details?.token0?.id} a1={pool?.details?.token1?.id} size={26} margin={true} />
        </div>
        <div className="flex flex-1 justify-between min-w-0">
          <button className="focus:outline-none text-left" onClick={() => onPoolClick(pool?.id)}>
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

export default YieldItem
