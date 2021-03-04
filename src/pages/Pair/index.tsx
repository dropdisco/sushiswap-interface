import React from 'react'
import styled from 'styled-components'

// Components
import { AutoColumn } from '../../components/Column'
import Plugin from './Plugin'
import Charts from './Charts'

const PageWrapper = styled(AutoColumn)`
  max-width: 1280px;
  width: 100%;
`

export default function Pool() {
  const tokenA = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
  const tokenB = '0x6b3595068778dd592e39a122f4f5a5cf09c90fe2'

  return (
    <>
      <PageWrapper>
        <div className="flex overflow-x-hidden h-full">
          <Plugin initialSection={'swap'} tokenA={tokenA} tokenB={tokenB} />
          <Charts tokenAddress={tokenA} pairAddress={undefined} />
        </div>
      </PageWrapper>
    </>
  )
}
