import React, { useEffect, useState } from 'react'
import { Transition } from '@headlessui/react'

interface AnimatedVisibilityProps {
  visible: any
  children?: any
}

const AnimatedVisibility = ({ visible, children }: AnimatedVisibilityProps) => {
  const [noDisplay, setNoDisplay] = useState(!visible)
  useEffect(() => {
    if (!visible) setNoDisplay(true)
    else setTimeout(() => setNoDisplay(false), 200)
  }, [visible])

  //const style = noDisplay ? { display: 'none' } : null
  return (
    <Transition
      show={noDisplay ? false : true}
      enter="transition-opacity duration-200"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity duration-100"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
      className="w-full"
    >
      {children}
    </Transition>
  )
}

export default AnimatedVisibility
