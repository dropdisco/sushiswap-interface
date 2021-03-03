import React from 'react'
//import { BigNumber } from '@ethersproject/bignumber'
//import useUserBalances from './queries/useUserBalances'
//import useUserFarms from './queries/useUserFarms'
import useFarm from './queries/useFarm'
//import useMakerInfo from './queries/useMakerInfo'
//import useTokenBalance from './queries/useTokenBalance'
//import useStakedBalance from './queries/useStakedBalance'

const TestBed = () => {
  //const { userFarm, userLP } = useDashboard()
  //const { userBalances } = useUserBalances()
  //const { farms } = useUserFarms()
  //const { makerInfo } = useMakerInfo()

  //const tokenBalance = useTokenBalance('0x795065dcc9f64b5614c407a6efdc400da6221fb0')
  //const stakedBalance = useStakedBalance({ lpTokenAddress: '0x795065dcc9f64b5614c407a6efdc400da6221fb0' })
  const pid = useFarm('0x795065dcc9f64b5614c407a6efdc400da6221fb0')

  // console.log('userBalances:', userBalances)
  // console.log('userFarms:', farms)
  // console.log('makerInfo:', makerInfo)
  // console.log('tokenBalance:', tokenBalance)
  console.log('pid:', pid)
  return <></>
}

export default TestBed
