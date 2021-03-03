/* eslint-disable react/prop-types */
// Todo: Refactor to Typescript
import React, { useState, useEffect, useRef } from 'react'

import { formattedNum } from '../../utils'
import { useDarkModeManager } from '../../state/user/hooks'

import { createChart } from 'lightweight-charts'
import dayjs from 'dayjs'

function usePrevious(value) {
  const ref = useRef()
  useEffect(() => {
    ref.current = value
  }, [value])
  return ref.current
}

const BarChart = ({
  data,
  width,
  height, //= 300,
  margin = true,
  timeKey,
  valueKey,
  valueFormatter = val => formattedNum(val, true)
}) => {
  //console.log("data:", data);

  // reference for DOM element to create with chart
  const ref = useRef()
  // pointer to the chart object
  const [chartCreated, setChartCreated] = useState(false)
  //const dataPrev = usePrevious(data)

  const [darkMode] = useDarkModeManager()
  const textColor = darkMode ? 'white' : 'black'
  const previousTheme = usePrevious(darkMode)
  // reset the chart if theme switches
  useEffect(() => {
    if (chartCreated && previousTheme !== darkMode) {
      // remove the tooltip element
      const tooltip = document.getElementById('tooltip-id')
      const node = document.getElementById('bar-chart')
      node.removeChild(tooltip)
      chartCreated.resize(0, 0)
      setChartCreated()
    }
  }, [chartCreated, darkMode, previousTheme])

  //   useEffect(() => {
  //     if (data !== dataPrev && chartCreated) {
  //       // remove the tooltip element
  //       const tooltip = document.getElementById('tooltip-id')
  //       const node = document.getElementById('bar-chart')
  //       node.removeChild(tooltip)
  //       chartCreated.resize(0, 0)
  //       setChartCreated()
  //     }
  //   }, [chartCreated, data, dataPrev])

  const formattedData = data?.map(entry => {
    //console.log("entry:", entry[valueKey]);
    return {
      time: parseFloat(entry[timeKey]),
      value: parseFloat(entry[valueKey])
    }
  })

  const baseValue = formattedData?.[formattedData.length - 1]['value']
  const baseTime = formattedData?.[formattedData.length - 1]['time']

  // if no chart created yet, create one with options and add to DOM manually
  useEffect(() => {
    if (!chartCreated) {
      const chart = createChart(ref.current, {
        width: width,
        height: height,
        layout: {
          backgroundColor: 'transparent',
          textColor: textColor
        },
        rightPriceScale: {
          visible: false
        },
        leftPriceScale: {
          visible: false
        },
        timeScale: {
          visible: false
        },
        crosshair: {
          vertLine: {
            width: 2,
            color: 'rgba(255, 255, 255, 0.05)',
            style: 0
          },
          horzLine: {
            visible: false,
            labelVisible: false
          }
        },
        grid: {
          vertLines: {
            visible: false
          },
          horzLines: {
            visible: false
          }
        },
        localization: {
          priceFormatter: val => formattedNum(val)
        },
        handleScroll: {
          mouseWheel: false,
          pressedMouseMove: false,
          horzTouchDrag: false,
          vertTouchDrag: false
        },
        handleScale: {
          mouseWheel: false,
          pressedMouseMove: false,
          horzTouchDrag: false,
          vertTouchDrag: false
        }
      })

      const histogramSeries = chart.addHistogramSeries({
        color: 'rgba(33, 114, 229, 0.75)', //'rgba(4, 200, 6, 1)',
        base: 0,
        priceLineVisible: false
      })

      histogramSeries.setData(formattedData)

      const toolTip = document.createElement('div')
      toolTip.setAttribute('id', 'tooltip-id')
      toolTip.className = 'three-line-legend'
      ref.current.appendChild(toolTip)
      toolTip.style.display = 'block'
      toolTip.style.position = 'absolute'
      toolTip.style.left = '0px'
      toolTip.style.top = '0px'
      toolTip.style.backgroundColor = 'transparent'

      // get the title of the chart
      function setLastBarText() {
        toolTip.innerHTML =
          baseValue && baseTime
            ? `<div style="font-size: 33px; color: ${textColor}">` +
              valueFormatter(baseValue) +
              `<div style="font-size: 12px; color: ${textColor}">` +
              dayjs.unix(baseTime).format('MM/DD h:mm A') +
              ' UTC' +
              '</div>' +
              '</div>'
            : ''
      }
      setLastBarText()

      // update the title when hovering on the chart
      chart.subscribeCrosshairMove(function(param) {
        if (
          param === undefined ||
          param.time === undefined ||
          param.point.x < 0 ||
          param.point.x > width ||
          param.point.y < 0 ||
          param.point.y > height
        ) {
          setLastBarText()
        } else {
          const price = param.seriesPrices.get(histogramSeries)
          const time = dayjs.unix(param.time).format('MM/DD h:mm A')
          //console.log("time:", param.time, time);
          //const time = dayjs.unix(param.time).format("MM/DD h:mm A");
          toolTip.innerHTML =
            `<div style="font-size: 33px; color: ${textColor}">` +
            valueFormatter(price) +
            `<div style="font-size: 12px; color: ${textColor}">` +
            time +
            ' UTC' +
            '</div>' +
            '</div>'
        }
      })

      chart.timeScale().fitContent()

      setChartCreated(chart)
    }
  }, [chartCreated, formattedData, width, height, valueFormatter, margin, textColor, baseValue, baseTime])

  // responsiveness
  useEffect(() => {
    if (width) {
      chartCreated && chartCreated.resize(width, height)
      chartCreated && chartCreated.timeScale().scrollToPosition(0)
    }
  }, [chartCreated, height, width])

  return (
    <div className="relative pt-16">
      <div ref={ref} id="bar-chart" />
    </div>
  )
}

export default BarChart
