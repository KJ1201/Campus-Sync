import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AllEventsPage from './pages/AllEventsPage'
import EventDetailPage from './pages/EventDetailPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AllEventsPage />} />
        <Route path="/events/:id" element={<EventDetailPage />} />
      </Routes>
    </BrowserRouter>
  )
}
