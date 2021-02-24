import { useCallback, useEffect, useState } from 'react'
import { BigNumber } from '@ethersproject/bignumber'
import { useActiveWeb3React } from '../../hooks'
import { useMasterChefContract } from '../useContract'
import { useBlockNumber } from '../../state/application/hooks'

const useStakedBalance = (pid: number) => {
  const [balance, setBalance] = useState(BigNumber.from(0))
  const { account } = useActiveWeb3React()
  const currentBlockNumber = useBlockNumber()
  const masterChefContract = useMasterChefContract()

  const getStaked = async (id: number | null | undefined, owner: string | null | undefined): Promise<string> => {
    try {
      const { amount } = await masterChefContract?.userInfo(id, owner)
      return amount
    } catch (e) {
      return '0'
    }
  }

  const fetchBalance = useCallback(async () => {
    const balance = await getStaked(pid, account)
    setBalance(BigNumber.from(balance))
  }, [account, pid])

  useEffect(() => {
    if (account && masterChefContract) {
      fetchBalance()
    }
  }, [account, setBalance, currentBlockNumber, fetchBalance, masterChefContract])

  return balance
}

export default useStakedBalance
