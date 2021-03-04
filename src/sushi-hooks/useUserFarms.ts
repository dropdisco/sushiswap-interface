import { useCallback, useEffect, useState } from 'react'
import { BigNumber } from '@ethersproject/bignumber'

import { useDashboardContract, useDashboard2Contract, useMasterChefContract } from './useContract'
import { useActiveWeb3React } from '../hooks/index'

import Fraction from '../constants/Fraction'

const useDashboard = () => {
  const { account } = useActiveWeb3React()
  const masterChefContract = useMasterChefContract()
  const dashboardContract = useDashboardContract()
  const dashboard2Contract = useDashboard2Contract()

  const [farms, setFarms] = useState<any | undefined>()

  // Todo: could break these up into multiple hooks;
  // Find Balances
  const find = useCallback(async () => {
    // todo: will need to refactor out of useActiveWeb3React dep

    const poolsInfo = await dashboard2Contract?.getPools([])
    // Find all User Pools ---------------------------------------//
    const pids = [...Array(poolsInfo[0].poolLength - 1).keys()].filter(
      pid => ![29, 30, 33, 45, 61, 62, 102, 124, 125, 126].includes(pid)
    )
    const pools = await dashboard2Contract?.findPools(account, pids)
    const userFarms = [] as any
    pools.map((pool: { pid: any; allocPoint: any; lpToken: any; token0: any; token1: any }) => {
      userFarms.push({
        pid: pool.pid.toNumber(),
        allocPoint: pool.allocPoint.toNumber(),
        lpToken: pool.lpToken,
        token0asset: pool.token0,
        token1asset: pool.token1,
        staked: true
      })
    })
    const userFarmsDetails = await dashboard2Contract?.pollPools(
      account,
      userFarms.map((a: any) => a.pid)
    )
    console.log('userFarmsDetails:', userFarmsDetails)

    const ethRate = await dashboard2Contract?.getETHRate('0xdAC17F958D2ee523a2206206994597C13D831ec7') // usdt

    // todo: redunant, can combine with above
    const tokenDetailsFarm = await dashboardContract?.getTokenInfo(
      Array.from(new Set(userFarms?.reduce((a: any, b: any) => a.push(b.token0asset, b.token1asset) && a, [])))
    )

    const userFarmsWithDetails = await Promise.all(
      userFarms.map(async (farm: any) => {
        const details = userFarmsDetails?.find((detail: any) => farm.pid === detail.pid.toNumber())
        const token0Details = tokenDetailsFarm?.find((token: { token: string }) => farm.token0asset === token.token)
        const token1Details = tokenDetailsFarm?.find((token: { token: string }) => farm.token1asset === token.token)

        const token0Rate = Fraction.from(details.token0rate, BigNumber.from(10).pow(token0Details?.decimals)).toString()
        const token1Rate = Fraction.from(details.token1rate, BigNumber.from(10).pow(token1Details?.decimals)).toString()
        const ethUSDRate = Fraction.from(ethRate, BigNumber.from(10).pow(6)).toString()

        // todo: number is slightly off? compared to app.boring, app, analytics
        console.log(
          'issue:',
          details?.balance
            .mul(details?.reserve0)
            .div(details?.totalSupply)
            .div(BigNumber.from(10).pow(token0Details?.decimals))
            .toNumber()
        )
        const token0Balance = Fraction.from(
          details?.balance.mul(details?.reserve0).div(details?.totalSupply),
          BigNumber.from(10).pow(token0Details?.decimals)
        ).toString()
        const token1Balance = Fraction.from(
          details?.balance.mul(details?.reserve1).div(details?.totalSupply),
          BigNumber.from(10).pow(token1Details?.decimals)
        ).toString()

        // todo: refactor
        const token0Value =
          (parseFloat(token0Balance) * parseFloat(ethUSDRate)) /
          (parseFloat(token0Rate) !== 0 ? parseFloat(token0Rate) : 1)
        const token1Value =
          (parseFloat(token1Balance) * parseFloat(ethUSDRate)) /
          (parseFloat(token1Rate) !== 0 ? parseFloat(token1Rate) : 1)

        //console.log('value:', token0Balance, token1Balance, token0Value + token1Value)

        const pending = await masterChefContract?.pendingSushi(farm.pid, account)
        //console.log('pending:', pending)
        return {
          ...farm,
          token0balance: token0Balance,
          token1balance: token1Balance,
          value: token0Value + token1Value,
          pending: Fraction.from(pending, BigNumber.from(10).pow(18)).toString()
        }
      })
    )
    setFarms(userFarmsWithDetails)
  }, [account, dashboard2Contract, dashboardContract, masterChefContract])

  useEffect(() => {
    if (account && dashboard2Contract && dashboardContract && masterChefContract) {
      find()
    }
  }, [account, dashboard2Contract, dashboardContract, find, masterChefContract])

  return { farms }
}

export default useDashboard
