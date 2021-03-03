import React, { useCallback, useState } from 'react'
import styled from 'styled-components'

import { WrapperNoPadding } from '../../components/swap/styleds'

import { AutoColumn } from '../../components/Column'
import HarvestPanel from './HarvestPanel'
import StakeInputPanel from './StakeInputPanel'

export const PluginBody = styled.div`
  position: relative;
  width: 100%;
  background: ${({ theme }) => theme.bg1};
`
type StakeProps = {
  pair: any
}

export default function Stake({ pair }: StakeProps) {
  // track and parse user input
  const [typedValue, setTypedValue] = useState('')
  // wrapped onUserInput to clear signatures
  const onUserInput = useCallback((typedValue: string) => {
    setTypedValue(typedValue)
  }, [])
  // used for max input button
  const maxAmountInput = '10000'
  const atMaxAmount = false
  const handleMax = useCallback(() => {
    maxAmountInput && onUserInput(maxAmountInput)
  }, [maxAmountInput, onUserInput])

  // find pair in masterchef

  return (
    <>
      <PluginBody>
        <WrapperNoPadding id="stake-page">
          {/* <AutoColumn gap={isExpertMode ? 'md' : 'none'} style={{ paddingBottom: '1rem' }}> */}
          <AutoColumn style={{ paddingBottom: '1rem' }}>
            <HarvestPanel
              lpTokenAddress={'0x795065dcc9f64b5614c407a6efdc400da6221fb0'}
              label={''}
              disableCurrencySelect={true}
              customBalanceText={'Available to deposit: '}
              id="stake-liquidity-token"
              buttonText="Deposit"
              cornerRadiusBottomNone={true}
            />
          </AutoColumn>
          <AutoColumn>
            <StakeInputPanel
              lpTokenAddress={'0x795065dcc9f64b5614c407a6efdc400da6221fb0'}
              label={''}
              disableCurrencySelect={true}
              customBalanceText={'Available to deposit: '}
              id="stake-liquidity-token"
              buttonText="Deposit"
              cornerRadiusBottomNone={true}
            />
          </AutoColumn>
        </WrapperNoPadding>
      </PluginBody>
    </>
  )
}
