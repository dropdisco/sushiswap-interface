import { useCallback, useEffect, useState } from 'react'
import { BigNumber } from '@ethersproject/bignumber'

import { useDashboard2Contract } from './useContract'
import { useActiveWeb3React } from '../hooks/index'

const useDashboard = () => {
  const { account } = useActiveWeb3React()
  const dashboard2Contract = useDashboard2Contract()

  const [userFarms, setUserFarms] = useState<any | undefined>()

  // Todo: could break these up into multiple hooks;
  // Find Balances
  const find = useCallback(async () => {
    // todo: will need to refactor out of useActiveWeb3React dep

    const poolsInfo = await dashboard2Contract?.getPools([])
    const assets = [] as any

    // Find all Pools
    const pids = [...Array(poolsInfo[0].poolLength - 1).keys()].filter(
      pid => ![29, 30, 33, 45, 61, 62, 102, 124, 125, 126].includes(pid)
    )
    const pools = await dashboard2Contract?.findPools(account, pids)

    console.log('user_pools:', pools)
    pools.map((pool: { pid: any; allocPoint: any; lpToken: any; token0: any; token1: any }) => {
      assets.push({
        pid: BigNumber.from(pool.pid).toNumber(),
        allocPoint: BigNumber.from(pool.allocPoint).toNumber(),
        address: pool.pid + '_pid_staked',
        name: null,
        symbol: null,
        decimals: null,
        lpToken: pool.lpToken,
        token0asset: pool.token0,
        token1asset: pool.token1,
        view: 'slp',
        staked: true
      })
    })
    setUserFarms(assets)
  }, [account, dashboard2Contract])

  useEffect(() => {
    if (account && dashboard2Contract) {
      find()
    }
  }, [account, dashboard2Contract, find])

  return { userFarms }
}

export default useDashboard
