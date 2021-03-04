import { useCallback, useEffect, useState } from 'react'

import { useDashboard2Contract, useMasterChefContract } from '../useContract'

const useAllFarms = () => {
  const masterChefContract = useMasterChefContract()
  const dashboard2Contract = useDashboard2Contract()

  const [farms, setFarms] = useState<any | undefined>()

  // Todo: could break these up into multiple hooks
  // Todo: refactor into useMemo pattern
  // Find Balances
  const find = useCallback(async () => {
    // todo: will need to refactor out of useActiveWeb3React dep
    const poolsInfo = await dashboard2Contract?.getPools([])
    setFarms(poolsInfo)
  }, [dashboard2Contract])

  useEffect(() => {
    if (dashboard2Contract && masterChefContract) {
      find()
    }
  }, [dashboard2Contract, masterChefContract, find])

  return { farms }
}

export default useAllFarms
