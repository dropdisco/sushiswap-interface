import * as React from 'react'
import { Menu, Transition } from '@headlessui/react'

import { useDarkModeManager } from '../../../state/user/hooks'

const SortByDropdown = ({ requestSort, sortConfigKey }) => {
  const [darkMode] = useDarkModeManager()
  return (
    <div className="flex items-center justify-center">
      <div className="relative inline-block text-left">
        <Menu>
          {({ open }) => (
            <>
              <span className="rounded-md">
                <Menu.Button className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium leading-5 transition duration-150 ease-in-out rounded-md hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:bg-gray-50 active:text-gray-800">
                  <div className="whitespace-nowrap">SortBy{sortConfigKey ? ': ' + sortConfigKey : ''}</div>
                  <svg className="w-5 h-5 ml-2 -mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Menu.Button>
              </span>

              <Transition
                show={open}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items
                  static
                  className={
                    'z-20 absolute right-0 w-56 mt-2 origin-top-right divide-y divide-gray-100 rounded-md shadow-lg outline-none ' +
                    (darkMode ? 'bg-gray-800' : 'bg-white')
                  }
                >
                  <div className="py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => requestSort('symbol')}
                          className={'flex justify-between w-full px-4 py-2 text-sm leading-5 text-left'}
                        >
                          Symbol
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => requestSort('apy')}
                          className={'flex justify-between w-full px-4 py-2 text-sm leading-5 text-left'}
                        >
                          APY
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => requestSort('id')}
                          className={'flex justify-between w-full px-4 py-2 text-sm leading-5 text-left'}
                        >
                          PID
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => requestSort('tvl')}
                          className={'flex justify-between w-full px-4 py-2 text-sm leading-5 text-left'}
                        >
                          TVL
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </>
          )}
        </Menu>
      </div>
    </div>
  )
}

export default SortByDropdown
