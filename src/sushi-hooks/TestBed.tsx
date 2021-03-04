import React from 'react'
//import useUserBalances from './useUserBalances'
//import useUserFarms from './useUserFarms'
import useFarm from './useFarm'
//import useMakerInfo from './useMakerInfo'
//import useTokenBalance from './useTokenBalance'
//import useStakedBalance from './useStakedBalance'

const TestBed = () => {
  //const { userFarm, userLP } = useDashboard()
  //const { userBalances } = useUserBalances()
  //const { farms } = useUserFarms()
  //const { makerInfo } = useMakerInfo()

  //const tokenBalance = useTokenBalance('0x795065dcc9f64b5614c407a6efdc400da6221fb0')
  //const stakedBalance = useStakedBalance({ lpTokenAddress: '0x795065dcc9f64b5614c407a6efdc400da6221fb0' })
  const pid = useFarm('0x795065dcc9f64b5614c407a6efdc400da6221fb0')
  console.log('pid:', pid)

  // console.log('userBalances:', userBalances)
  // console.log('userFarms:', farms)
  // console.log('makerInfo:', makerInfo)
  // console.log('tokenBalance:', tokenBalance)
  return <></>
}

export default TestBed
