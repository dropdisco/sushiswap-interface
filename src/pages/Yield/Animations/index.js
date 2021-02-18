import React from 'react'
import { motion } from 'framer-motion'

export const FadeIn = ({ children }) => {
  return (
    <>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {
            scale: 0.8,
            opacity: 0
          },
          visible: {
            scale: 1,
            opacity: 1,
            transition: {
              delay: 0.4
            }
          }
        }}
      >
        {children}
      </motion.div>
    </>
  )
}
