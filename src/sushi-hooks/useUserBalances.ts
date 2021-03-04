import { useCallback, useEffect, useState } from 'react'
import { BigNumber } from '@ethersproject/bignumber'

import { useDashboardContract, useDashboard2Contract, useMasterChefContract } from '../useContract'
import { useActiveWeb3React } from '../../hooks/index'
import { ChainId } from '@sushiswap/sdk'

import Fraction from '../../constants/Fraction'

const useDashboard = () => {
  const { account, chainId } = useActiveWeb3React()
  const masterChefContract = useMasterChefContract()
  const dashboardContract = useDashboardContract()
  const dashboard2Contract = useDashboard2Contract()

  const [userBalances, setUserBalances] = useState<any | undefined>()

  // Todo: could break these up into multiple hooks
  // Todo: refactor into useMemo pattern
  // Find Balances
  const find = useCallback(async () => {
    // todo: will need to refactor out of useActiveWeb3React dep
    const factory = (
      await dashboardContract?.getFactoryInfo([
        chainId == ChainId.MAINNET
          ? '0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac'
          : '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f'
      ])
    )[0]

    const poolsInfo = await dashboard2Contract?.getPools([])

    // Find all User Pairs ---------------------------------------//
    // run through all pairs in increments
    // todo: refactor for efficiency
    const userLP = [] as any
    const stepsize = 3333
    for (let b = 0; b <= BigNumber.from(factory.allPairsLength).toNumber() / stepsize; b++) {
      const pairs = await dashboardContract?.findPairs(
        account,
        factory.factory,
        b * stepsize,
        [BigNumber.from(factory.allPairsLength).toNumber(), (b + 1) * stepsize].reduce((m, e) => (e < m ? e : m))
      )
      pairs.map((pair: { token: string; token0: any; token1: any }) => {
        //console.log('pair:', pair)
        userLP.push({
          lpToken: pair.token,
          token0asset: pair.token0,
          token1asset: pair.token1,
          factory: factory.factory
        })
      })
    }
    const tokenDetails = await dashboardContract?.getTokenInfo(
      Array.from(new Set(userLP?.reduce((a: any, b: any) => a.push(b.token0asset, b.token1asset) && a, [])))
    )
    //console.log('tokenDetails:', tokenDetails)

    const tokenRates = await dashboardContract?.getBalances(
      account,
      Array.from(new Set(userLP?.reduce((a: any, b: any) => a.push(b.token0asset, b.token1asset) && a, []))),
      factory.factory,
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' //Use WETH as currency for rate
    )
    //console.log('tokenRates:', tokenRates)

    const userLPDetails = await dashboard2Contract?.getPairsFull(
      account,
      userLP.map((a: any) => a.lpToken)
    )

    // Todo: account for non-ETH based pairs
    const ethRate = await dashboard2Contract?.getETHRate('0xdAC17F958D2ee523a2206206994597C13D831ec7') // usdt
    //console.log('ethRate:', ethRate)

    const userLPWithDetails = userLP.map((lp: any) => {
      const details = userLPDetails?.find((pair: { token: string }) => lp.lpToken === pair.token)
      const token0Details = tokenDetails?.find((token: { token: string }) => lp.token0asset === token.token)
      const token1Details = tokenDetails?.find((token: { token: string }) => lp.token1asset === token.token)
      const token0Rates = tokenRates?.find((token: { token: string }) => lp.token0asset === token.token)
      const token1Rates = tokenRates?.find((token: { token: string }) => lp.token1asset === token.token)

      const token0Rate = Fraction.from(token0Rates?.rate, BigNumber.from(10).pow(token0Details?.decimals)).toString()
      const token1Rate = Fraction.from(token1Rates?.rate, BigNumber.from(10).pow(token1Details?.decimals)).toString()
      const ethUSDRate = Fraction.from(ethRate, BigNumber.from(10).pow(6)).toString()

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

      return {
        ...lp,
        token0balance: token0Balance,
        token1balance: token1Balance,
        value: token0Value + token1Value
        // balance: details?.balance,
        // reserve0: details?.reserve0,
        // reserve1: details?.reserve1,
        // totalSupply: details?.totalSupply,
      }
    })

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
    // console.log('userFarmsDetails:', userFarmsDetails)
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

    setUserBalances({ lp: userLPWithDetails, farms: userFarmsWithDetails })
  }, [account, chainId, dashboard2Contract, dashboardContract, masterChefContract])

  useEffect(() => {
    if (account && dashboard2Contract && dashboardContract && masterChefContract) {
      find()
    }
  }, [account, dashboard2Contract, dashboardContract, masterChefContract, find])

  return { userBalances }
}

export default useDashboard
