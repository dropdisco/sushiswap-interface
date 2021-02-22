import React from 'react'
import useUserBalances from './useUserBalances'
import useUserFarms from './useUserFarms'
import useMakerInfo from './useMakerInfo'

const TestBed = () => {
  //const { userFarm, userLP } = useDashboard()
  const { userBalances } = useUserBalances()
  const { userFarms } = useUserFarms()
  const { makerInfo } = useMakerInfo()

  console.log('userBalances:', userBalances)
  console.log('userFarms:', userFarms)
  console.log('makerInfo:', makerInfo)
  return <></>
}

export default TestBed
