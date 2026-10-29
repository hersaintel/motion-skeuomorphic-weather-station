import { WeatherStation } from '../components/WeatherStation'
import { MotionConfig } from 'motion/react'

function App() {
  return (
    <MotionConfig reducedMotion="user">
      <WeatherStation />
    </MotionConfig>
  )
}

export default App
