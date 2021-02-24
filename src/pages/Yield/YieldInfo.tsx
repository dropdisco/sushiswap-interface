import React, { useCallback, useState } from 'react'
import { Token, ChainId } from '@sushiswap/sdk'
import { Link } from 'react-router-dom'

import { RowBetween } from '../../components/Row'
import { ButtonSecondary, ButtonPrimary, ButtonEmpty } from '../../components/Button'
import { TYPE, ExternalLink } from '../../theme'
import { currencyId } from '../../utils/currencyId'

import DoubleLogo from './DoubleLogo'
import CurrencyInputPanel from './CurrencyInputPanel'

import { useDarkModeManager } from '../../state/user/hooks'
import { useActiveWeb3React } from '../../hooks/index'

import useAllowance from '../../sushi-hooks/queries/useAllowance'
import useApprove from '../../sushi-hooks/actions/useApprove'
import useMasterChef from '../../sushi-hooks/actions/useMasterChef'
import useTokenBalance from '../../sushi-hooks/queries/useTokenBalance'
import useStakedBalance from '../../sushi-hooks/queries/useStakedBalance'

// Additional Dep
import cn from 'classnames'
import _ from 'lodash'

interface YieldInfoProps {
  pool: any
  onClose?: any
}

const YieldInfo = ({ pool, onClose }: YieldInfoProps) => {
  const [darkMode] = useDarkModeManager()
  const { account } = useActiveWeb3React()

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

  const DAI = new Token(ChainId.MAINNET, '0x6B175474E89094C44Da98b954EedeAC495271d0F', 18, 'DAI', 'Dai Stablecoin')
  const USDC = new Token(ChainId.MAINNET, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 6, 'USDC', 'USD//C')

  const currency0 = DAI
  const currency1 = USDC

  const lpToken = pool?.pair

  // handle allowance
  const allowance = useAllowance(lpToken)

  // handle approval
  const [requestedApproval, setRequestedApproval] = useState(false)
  const { onApprove } = useApprove(lpToken)
  const handleApprove = useCallback(async () => {
    try {
      setRequestedApproval(true)
      const txHash = await onApprove()
      if (!txHash) {
        setRequestedApproval(false)
      }
    } catch (e) {
      console.log(e)
    }
  }, [onApprove, setRequestedApproval])

  // SLP token balance and staked balance
  const tokenBalance = useTokenBalance(pool?.pair)
  const stakedBalance = useStakedBalance(Number(pool?.id))

  //handle stake and unstake
  const { withdraw, deposit, harvest } = useMasterChef()

  // const state = {
  //   needsApproval: !allowance.toNumber(),
  //   pending: Number(pool?.userDetails.pending) > 0,
  //   availableSLP: tokenBalance > 0,
  //   stakedSLP: stakedBalance > 0
  // }

  return (
    <>
      <div
        className={cn(
          'md:sticky md:top-8 rounded-md md:border md:mt-24 md:mx-4 w-full md:w-96',
          darkMode ? 'border-gray-600' : 'border-gray-300'
        )}
      >
        {pool ? (
          <div className="text-lg">
            <div className="flex justify-between items-center p-6">
              <div className="flex flex-shrink-0">
                <DoubleLogo a0={pool?.details?.token0?.id} a1={pool?.details?.token1?.id} size={26} margin={true} />
                <span className="ml-4">
                  {_.get(pool, 'details.token0.symbol', '')}-{_.get(pool, 'details.token1.symbol', '')}
                </span>
              </div>
              <button onClick={onClose}>
                {/* Close Icon */}
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div>
              <div className="pt-4 px-6">
                <RowBetween>
                  <ButtonPrimary
                    padding="8px"
                    borderRadius="8px"
                    as={Link}
                    to={`/add/${currencyId(currency0)}/${currencyId(currency1)}`}
                    width="48%"
                  >
                    Add
                  </ButtonPrimary>
                  <ButtonPrimary
                    padding="8px"
                    borderRadius="8px"
                    as={Link}
                    width="48%"
                    to={`/remove/${currencyId(currency0)}/${currencyId(currency1)}`}
                  >
                    Remove
                  </ButtonPrimary>
                </RowBetween>
              </div>
              {pool?.userDetails && (
                <div className="pt-4 px-6">
                  <CurrencyInputPanel
                    value={Number(pool?.userDetails?.pending).toFixed(4)}
                    onUserInput={() => console.log('input')}
                    showMaxButton={false}
                    lpToken={pool?.pair}
                    hideBalance={true}
                    label={'Your unclaimed SUSHI'}
                    disableCurrencySelect={true}
                    id="stake-liquidity-token"
                    buttonText="Claim"
                  />
                </div>
              )}
              <div className="pt-4 px-6">
                <CurrencyInputPanel
                  value={typedValue}
                  onUserInput={onUserInput}
                  onMax={handleMax}
                  showMaxButton={!atMaxAmount}
                  lpToken={pool?.pair}
                  label={''}
                  disableCurrencySelect={true}
                  customBalanceText={'Available to deposit: '}
                  id="stake-liquidity-token"
                  buttonText="Deposit"
                  cornerRadiusBottomNone
                />
              </div>
              <div className="px-6">
                <CurrencyInputPanel
                  value={typedValue}
                  onUserInput={onUserInput}
                  onMax={handleMax}
                  showMaxButton={!atMaxAmount}
                  lpToken={pool?.pair}
                  label={''}
                  disableCurrencySelect={true}
                  customBalanceText={'Available to withdraw: '}
                  id="stake-liquidity-token"
                  buttonText="Withdraw"
                  cornerRadiusTopNone
                />
              </div>
              <div className="py-4 px-6">
                <ButtonSecondary padding="8px" borderRadius="8px">
                  <ExternalLink
                    style={{ width: '100%', textAlign: 'center' }}
                    href={`https://analytics.sushi.com/users/${account}`}
                  >
                    View accrued fees and analytics<span style={{ fontSize: '11px' }}>↗</span>
                  </ExternalLink>
                </ButtonSecondary>
              </div>
            </div>
          </div>
        ) : (
          '--'
        )}
      </div>
    </>
  )
}

export default YieldInfo
