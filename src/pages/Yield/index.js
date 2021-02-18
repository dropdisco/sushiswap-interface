/* eslint-disable react/prop-types */

import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

// Components
import { SwapPoolTabs } from '../../components/NavigationTabs'
import { AutoColumn } from '../../components/Column'
import DoubleLogo from './DoubleLogo'
//import TokenLogo from './TokenLogo'
import SortByDropdown from './SortBy'

// Hooks
import { useDarkModeManager } from '../../state/user/hooks'
//import { useActiveWeb3React } from '../../hooks'
import useFuse from '../../hooks/useFuse'
import useSortableData from '../../hooks/useSortableData'

// Apollo Queries
import { exchange } from '../../apollo/client'
import { liquidityPositionSubsetQuery } from '../../apollo/queries'

// Additional Libraries
import sushiData from '@sushiswap/sushi-data'
import _ from 'lodash'
import { FadeIn } from './Animations'

// Image Assets
import XSushiGlow from '../../assets/images/xsushi_glow.png'

const PageWrapper = styled(AutoColumn)`
  max-width: 640px;
  width: 100%;
`

export default function Pool() {
  return <></>
}
