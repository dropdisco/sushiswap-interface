import { useCallback, useEffect, useState } from 'react'
import { useActiveWeb3React } from '../../hooks'
import { useMasterChefContract, useDashboard2Contract } from '../useContract'
import { useBlockNumber } from '../../state/application/hooks'
import { isAddress } from '../../utils'

const useFarm = (lpTokenAddress: string) => {
  const [farm, setFarm] = useState<any>()
  const { account } = useActiveWeb3React()
  const currentBlockNumber = useBlockNumber()
  const masterChefContract = useMasterChefContract()
  const dashboard2Contract = useDashboard2Contract()
  const lpAddressChecksum = isAddress(lpTokenAddress)

  const fetchBalance = useCallback(async () => {
    // todo: helper contract side there should be a method to lookup pool by address
    const poolsInfo = await dashboard2Contract?.getPools([])
    const pids = [...Array(poolsInfo[0].poolLength - 1).keys()].filter(
      pid => ![29, 30, 33, 45, 61, 62, 102, 124, 125, 126].includes(pid)
    )
    const pools = await dashboard2Contract?.getPools(pids)
    const foundPool = pools?.[1]?.find((pair: { lpToken: string }) => lpAddressChecksum === pair.lpToken)

    setFarm({ pid: foundPool.pid.toNumber() })
  }, [dashboard2Contract, lpAddressChecksum])

  useEffect(() => {
    if (account && masterChefContract && dashboard2Contract) {
      fetchBalance()
    }
  }, [account, currentBlockNumber, fetchBalance, masterChefContract, dashboard2Contract, lpAddressChecksum])

  return farm
}

export default useFarm
