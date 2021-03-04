import { useCallback, useEffect, useState } from 'react'
import { BigNumber } from '@ethersproject/bignumber'
import { useActiveWeb3React } from '../hooks'
import { useMasterChefContract } from './useContract'
import { useBlockNumber } from '../state/application/hooks'

import Fraction from '../constants/Fraction'

const useStakedBalance = (pid: number) => {
  const [balance, setBalance] = useState<string>('0')
  const { account } = useActiveWeb3React()
  const currentBlockNumber = useBlockNumber()
  const masterChefContract = useMasterChefContract()

  const fetchBalance = useCallback(async () => {
    const getStaked = async (id: number | null | undefined, owner: string | null | undefined): Promise<string> => {
      try {
        const { amount } = await masterChefContract?.userInfo(id, owner)
        return Fraction.from(BigNumber.from(amount), BigNumber.from(10).pow(18)).toString()
      } catch (e) {
        return '0'
      }
    }
    const balance = await getStaked(pid, account)
    setBalance(balance)
  }, [account, masterChefContract, pid])

  useEffect(() => {
    if (account && masterChefContract) {
      fetchBalance()
    }
  }, [account, setBalance, currentBlockNumber, fetchBalance, masterChefContract])

  return balance
}

export default useStakedBalance
