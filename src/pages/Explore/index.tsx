import React from 'react'
import styled from 'styled-components'

// Components
import { AutoColumn } from '../../components/Column'

// Hooks
import { useDarkModeManager } from '../../state/user/hooks'

// Image Assets

// Additional Dep

const PageWrapper = styled(AutoColumn)`
  max-width: 840px;
  width: 100%;
`

export default function Explore() {
  const [darkMode] = useDarkModeManager()

  return (
    <>
      <PageWrapper></PageWrapper>
    </>
  )
}
