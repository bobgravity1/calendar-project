import 'chart.js/auto'
import { Dropdown } from './dropdown.tsx'

import { Line } from 'react-chartjs-2'

export const LineChart = () => {
  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <Dropdown />
      <div className="relative min-h-0 flex-1">
        <Line
          options={{
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
          }}
          data={{
            labels: ['Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
            datasets: [
              {
                label: '',
                data: [5, 2, 4, 1, 7],
                borderColor: '#fff',
                tension: 0.35,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#fff',
              },
            ],
          }}
        />
      </div>
    </div>
  )
}
