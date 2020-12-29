/* eslint-disable camelcase */
import React from 'react'

import styled from 'styled-components'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Props as DefaultTooltipContentProps } from 'recharts/types/component/DefaultTooltipContent'
import { DateTime } from 'luxon'

import { getClusterColor } from 'src/io/getClusterColors'

const ChartContainerOuter = styled.div`
  display: flex;
  justify-content: space-evenly;
  width: 100%;
`

const ChartContainerInner = styled.div`
  flex: 0 1 100%;
  width: 0;
`

const yAxisFormatter = (value: number) => value.toFixed(2)

export interface TooltipPayload {
  payload: { name: string; value: number; color: string }[]
  label: string
}

export function renderTooltipContent({ payload, label }: DefaultTooltipContentProps<number, string>) {
  return (
    <div className="bg-white">
      <ul className="list">
        {payload?.map(({ color, name, value }, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <li key={`item-${index}`} style={{ color }}>
            {`${name ?? ''}: ${value ?? 0}`}
          </li>
        ))}
      </ul>
    </div>
  )
}

export const AreaChartStyled = styled(AreaChart)`
  margin: 10px auto;
`

const margin = { left: -20, top: 0, bottom: 0, right: 10 }

const tickStyle = { fontSize: 12 }

const dateFormatter = (date: number) => {
  return DateTime.fromSeconds(date).toISODate()
}

export interface CountryDistributionDatum {
  week: string
  total_sequences: number
  cluster_counts: {
    [key: string]: number | undefined
  }
}

export interface CountryDistributionPlotProps {
  cluster_names: string[]
  distribution: CountryDistributionDatum[]
}

export function CountryDistributionPlot({ cluster_names, distribution }: CountryDistributionPlotProps) {
  const data = distribution.map(({ week, total_sequences, cluster_counts }) => {
    const total_cluster_sequences = Object.values(cluster_counts) // prettier-ignore
      .reduce<number>((result, count = 0) => result + (count ?? 0), 0)

    const others = total_sequences - total_cluster_sequences
    const weekSec = DateTime.fromFormat(week, 'yyyy-MM-dd').toSeconds()
    return { week: weekSec, ...cluster_counts, others }
  })

  return (
    <ChartContainerOuter>
      <ChartContainerInner>
        <ResponsiveContainer width="99%" aspect={1.5} debounce={0}>
          <AreaChartStyled margin={margin} data={data} stackOffset="expand">
            <XAxis dataKey="week" tickFormatter={dateFormatter} tick={tickStyle} allowDataOverflow />
            <YAxis tickFormatter={yAxisFormatter} domain={[0, 1]} tick={tickStyle} allowDataOverflow />
            <Tooltip content={renderTooltipContent} />
            {cluster_names.map((cluster, i) => (
              <Area
                key={cluster}
                type="monotone"
                dataKey={cluster}
                stackId="1"
                stroke="none"
                fill={getClusterColor(cluster)}
                isAnimationActive={false}
              />
            ))}

            <Area type="monotone" dataKey="others" stackId="1" stroke="none" fill="none" isAnimationActive={false} />

            <CartesianGrid stroke="#2222" />
          </AreaChartStyled>
        </ResponsiveContainer>
      </ChartContainerInner>
    </ChartContainerOuter>
  )
}