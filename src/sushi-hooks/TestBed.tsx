import React from 'react'
import { BigNumber } from '@ethersproject/bignumber'
import useUserBalances from './queries/useUserBalances'
import useUserFarms from './queries/useUserFarms'
import useMakerInfo from './queries/useMakerInfo'
import useTokenBalance from './queries/useTokenBalance'
import useStakedBalance from './queries/useStakedBalance'

const TestBed = () => {
  //const { userFarm, userLP } = useDashboard()
  const { userBalances } = useUserBalances()
  const { farms } = useUserFarms()
  const { makerInfo } = useMakerInfo()

  const tokenBalance = useTokenBalance('0x397ff1542f962076d0bfe58ea045ffa2d347aca0')
  const stakedBalance = useStakedBalance(12)

  console.log('userBalances:', userBalances)
  console.log('userFarms:', farms)
  console.log('makerInfo:', makerInfo)
  console.log('tokenBalance:', tokenBalance)
  console.log('stakedBalance:', stakedBalance)
  return <></>
}

export default TestBed
