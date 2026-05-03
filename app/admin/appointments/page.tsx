'use client'
import { useEffect, useState } from 'react'
import { createClient } from '../../../utils/supabase/client'

type FilterType = 'today' | 'week' | 'all'
type StatusType = 'booked' | 'completed' | 'no-show' | 'cancelled'

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [staff, setStaff] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterType>('today')
  const [selectedStaff, setSelectedStaff] = useState<string>('all')
  const [dailyRevenue, setDailyRevenue] = useState(0)
  
  // Edit modal state
  const [editing, setEditing] = useState<any | null>(null)
  const [editTime, setEditTime] = useState('')
  const [editStaff, setEditStaff] = useState('')
  const [editService, setEditService] = useState('')
  
  // Add booking modal state
  const [adding, setAdding] = useState(false)
  const [newCustomer, setNewCustomer] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newTime, setNewTime] = useState('')
  const [newStaff, setNewStaff] = useState('')
  const [newService, setNewService] = useState('')
  
  const supabase = createClient()

  const fetchStaff = async () => {
    const { data } = await supabase.from('staff').select('id, name').order('name')
    setStaff(data || [])
    if (data && data.length > 0) setNewStaff(data[0].name)
  }

  const fetchServices = async () => {
    const { data } = await supabase.from('services').select('id, name, duration_minutes, price').order('name')
    setServices(data || [])
    if (data && data.length > 0) setNewService(data[0].name)
  }

  const calculateRevenue = (apts: any[]) => {
    const completed = apts.filter(apt => apt.status === 'completed')
    const total = completed.reduce((sum, apt) => sum + (apt.price || 0), 0)
    setDailyRevenue(total)
  }

  const fetchAppointments = async () => {
    setLoading(true)
    
    let query = supabase
  .from('appointments_detailed')
  .select('*')
  .order('start_time_sast', { ascending: true })

    const now = new Date()
    const sastOffset = 2 * 60 * 60 * 1000
    const sastNow = new Date(now.getTime() + sastOffset)
    
    if (filter === 'today') {
      const startOfDay = new Date(sastNow)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(sastNow)
      endOfDay.setHours(23, 59, 59, 999)
      query = query.gte('start_time_sast', startOfDay.toISOString()).lte('start_time_sast', endOfDay.toISOString())
    }
    
    if (filter === 'week') {
      const startOfWeek = new Date(sastNow)
      startOfWeek.setDate(sastNow.getDate() - sastNow.getDay())
      startOfWeek.setHours(0, 0, 0, 0)
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)
      endOfWeek.setHours(23, 59, 59, 999)
      query = query.gte('start_time_sast', startOfWeek.toISOString()).lte('start_time_sast', endOfWeek.toISOString())
    }

    if (selectedStaff!== 'all') {
      query = query.eq('staff_name', selectedStaff)
    }

    const { data, error } = await query
    if (error) alert('Error: ' + error.message)
    else {
      setAppointments(data || [])
      calculateRevenue(data || [])
    }
    setLoading(false)
  }

  useEffect(() => { 
    fetchStaff()
    fetchServices()
  }, [])

  useEffect(() => { 
    fetchAppointments() 
  }, [filter, selectedStaff])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this booking?')) return
    const { error } = await supabase.from('appointments').delete().eq('id', id)
    if (error) alert('Error: ' + error.message)
    else {
      alert('Deleted')
      fetchAppointments()
    }
  }

  const handleStatusChange = async (id: string, newStatus: StatusType) => {
    const { error } = await supabase
  .from('appointments')
  .update({ status: newStatus })
  .eq('id', id)
    
    if (error) alert('Error: ' + error.message)
    else fetchAppointments()
  }

  const sendWhatsApp = (apt: any) => {
    const date = new Date(apt.start_time_sast).toLocaleDateString('en-ZA', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    })
    const time = new Date(apt.start_time_sast).toLocaleTimeString('en-ZA', {
      hour: '2-digit',
      minute: '2-digit'
    })
    
    const message = `Hi ${apt.customer_name}!\n\nConfirming your booking:\nDate: ${date}\nTime: ${time}\nService: ${apt.service_name} with ${apt.staff_name}\nPrice: R${apt.price}\n\nSee you soon!\n\nPlease reply YES to confirm or let us know if you need to reschedule.`
    
    const encodedMessage = encodeURIComponent(message)
    
    let phone = apt.customer_phone? apt.customer_phone.replace(/\D/g, '') : ''
    if (phone.startsWith('0')) {
      phone = '27' + phone.substring(1)
    }
    
    if (phone) {
      window.open(`https://wa.me/${phone}?text=${encodedMessage}`, '_blank')
    } else {
      window.open(`https://wa.me/?text=${encodedMessage}`, '_blank')
      alert('No phone number saved. WhatsApp opened - you can select the contact manually.')
    }
  }

  const sendReminders = async () => {
    const now = new Date()
    const sastOffset = 2 * 60 * 60 * 1000
    const sastNow = new Date(now.getTime() + sastOffset)
    const tomorrow = new Date(sastNow)
    tomorrow.setDate(sastNow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    const endOfTomorrow = new Date(tomorrow)
    endOfTomorrow.setHours(23, 59, 59, 999)

    const { data: tomorrowApts, error } = await supabase
    .from('appointments_detailed')
    .select('*')
    .eq('status', 'booked')
    .gte('start_time_sast', tomorrow.toISOString())
    .lte('start_time_sast', endOfTomorrow.toISOString())
    .order('start_time_sast', { ascending: true })

    if (error) {
      alert('Error fetching appointments: ' + error.message)
      return
    }

    if (!tomorrowApts || tomorrowApts.length === 0) {
      alert('No bookings for tomorrow')
      return
    }

    const withPhone = tomorrowApts.filter(a => a.customer_phone)
    const noPhone = tomorrowApts.filter(a =>!a.customer_phone)
    
    if (noPhone.length > 0) {
      alert(`${noPhone.length} bookings have no phone number. Sending reminders for ${withPhone.length} clients.`)
    }

    withPhone.forEach((apt, index) => {
      setTimeout(() => {
        const time = new Date(apt.start_time_sast).toLocaleTimeString('en-ZA', {
          hour: '2-digit',
          minute: '2-digit'
        })
        
        const message = `Hi ${apt.customer_name}!\n\nReminder for your appointment tomorrow:\nTime: ${time}\nService: ${apt.service_name} with ${apt.staff_name}\nPrice: R${apt.price}\n\nSee you then!\n\nReply YES to confirm or let us know if you need to reschedule.`
        
        let phone = apt.customer_phone.replace(/\D/g, '')
        if (phone.startsWith('0')) {
          phone = '27' + phone.substring(1)
        }
        
        const encodedMessage = encodeURIComponent(message)
        window.open(`https://wa.me/${phone}?text=${encodedMessage}`, '_blank')
      }, index * 1500)
    })

    if (withPhone.length > 0) {
      alert(`Opening WhatsApp for ${withPhone.length} reminders`)
    }
  }

  const openEdit = (apt: any) => {
    setEditing(apt)
    const date = new Date(apt.start_time_sast)
    const localISO = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, 16)
    setEditTime(localISO)
    setEditStaff(apt.staff_name)
    setEditService(apt.service_name)
  }

  const handleSaveEdit = async () => {
    if (!editing) return
    
    const selectedService = services.find(s => s.name === editService)
    const selectedStaffObj = staff.find(s => s.name === editStaff)
    
    if (!selectedService ||!selectedStaffObj) {
      alert('Invalid staff or service')
      return
    }

    const startTime = new Date(editTime)
    const endTime = new Date(startTime.getTime() + selectedService.duration_minutes * 60000)

    const { error } = await supabase
  .from('appointments')
  .update({
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        staff_id: selectedStaffObj.id,
        service_id: selectedService.id
      })
  .eq('id', editing.id)

    if (error) alert('Error: ' + error.message)
    else {
      alert('Updated')
      setEditing(null)
      fetchAppointments()
    }
  }

  const openAdd = () => {
    setAdding(true)
    const now = new Date()
    const localISO = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().slice(0, 16)
    setNewTime(localISO)
    setNewCustomer('')
    setNewPhone('')
  }

  const handleAddBooking = async () => {
    if (!newCustomer ||!newTime) {
      alert('Please fill in customer name and time')
      return
    }
    
    const selectedService = services.find(s => s.name === newService)
    const selectedStaffObj = staff.find(s => s.name === newStaff)
    
    if (!selectedService ||!selectedStaffObj) {
      alert('Invalid staff or service')
      return
    }

    const startTime = new Date(newTime)
    const endTime = new Date(startTime.getTime() + selectedService.duration_minutes * 60000)

    const { error } = await supabase
  .from('appointments')
  .insert({
        customer_name: newCustomer,
        customer_phone: newPhone || null,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        staff_id: selectedStaffObj.id,
        service_id: selectedService.id,
        status: 'booked'
      })

    if (error) alert('Error: ' + error.message)
    else {
      alert('Booking added')
      setAdding(false)
      setNewCustomer('')
      setNewPhone('')
      fetchAppointments()
    }
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'completed': return 'bg-green-100 border-green-400'
      case 'no-show': return 'bg-red-100 border-red-400'
      case 'cancelled': return 'bg-gray-100 border-gray-400'
      default: return 'bg-white border-gray-200'
    }
  }

  const FilterButton = ({ type, label }: { type: FilterType, label: string }) => (
    <button
      onClick={() => setFilter(type)}
      className={`px-4 py-2 rounded ${
        filter === type 
      ? 'bg-blue-600 text-white' 
          : 'bg-gray-200 text-black hover:bg-gray-300'
      }`}
    >
      {label}
    </button>
  )

  return (
    <div className="p-6 max-w-6xl mx-auto text-black">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-black">All Appointments</h1>
          {filter === 'today' && (
            <p className="text-lg font-semibold text-green-700 mt-1">
              Today's Revenue: R{dailyRevenue.toLocaleString('en-ZA')}
            </p>
          )}
          {filter === 'week' && (
            <p className="text-lg font-semibold text-blue-700 mt-1">
              This Week: R{dailyRevenue.toLocaleString('en-ZA')}
            </p>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2 items-center">
          <button
            onClick={openAdd}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-semibold"
          >
            + Add Booking
          </button>

          <button
            onClick={sendReminders}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded font-semibold"
          >
            📱 Send Reminders
          </button>
          
          <select
            value={selectedStaff}
            onChange={(e) => setSelectedStaff(e.target.value)}
            className="px-3 py-2 rounded border border-gray-300 bg-white text-black"
          >
            <option value="all">All Staff</option>
            {staff.map((s) => (
              <option key={s.id} value={s.name}>{s.name}</option>
            ))}
          </select>
          
          <FilterButton type="today" label="Today" />
          <FilterButton type="week" label="This Week" />
          <FilterButton type="all" label="All" />
        </div>
      </div>
      
      {loading? (
        <div className="p-6">Loading...</div>
      ) : appointments.length === 0? (
        <p className="text-black">No appointments found for this filter.</p>
      ) : (
        <div className="grid gap-4">
          {appointments.map((apt) => (
            <div key={apt.id} className={`border-2 rounded-lg p-4 text-black ${getStatusColor(apt.status)}`}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-lg text-black">{apt.customer_name}</p>
                    <span className="text-xs px-2 py-1 rounded bg-black text-white uppercase">
                      {apt.status || 'booked'}
                    </span>
                  </div>
                  <p className="text-gray-800">{apt.service_name} with {apt.staff_name}</p>
                  <p className="mt-2 text-gray-900">
                    {new Date(apt.start_time_sast).toLocaleDateString('en-ZA')} • {' '}
                    {new Date(apt.start_time_sast).toLocaleTimeString('en-ZA', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })} - {new Date(apt.end_time_sast).toLocaleTimeString('en-ZA', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  <p className="text-sm mt-1 text-gray-800">R{apt.price} • {apt.duration_minutes} min</p>
                  {apt.customer_phone && (
                    <p className="text-sm mt-1 text-gray-600">📱 {apt.customer_phone}</p>
                  )}
                </div>
                
                <div className="flex flex-col gap-2 ml-4">
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => sendWhatsApp(apt)}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                    >
                      WhatsApp
                    </button>
                    <button
                      onClick={() => openEdit(apt)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(apt.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Delete
                    </button>
                  </div>
                  
                  <div className="flex gap-1 flex-wrap">
                    <button
                      onClick={() => handleStatusChange(apt.id, 'completed')}
                      className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs"
                    >
                      ✓ Done
                    </button>
                    <button
                      onClick={() => handleStatusChange(apt.id, 'no-show')}
                      className="bg-orange-600 hover:bg-orange-700 text-white px-2 py-1 rounded text-xs"
                    >
                      No-show
                    </button>
                    <button
                      onClick={() => handleStatusChange(apt.id, 'booked')}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Booking Modal */}
      {adding && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md text-black">
            <h2 className="text-xl font-bold mb-4">Add New Booking</h2>
            
            <label className="block mb-2 font-semibold">Customer Name</label>
            <input
              type="text"
              value={newCustomer}
              onChange={(e) => setNewCustomer(e.target.value)}
              placeholder="Walk-in customer"
              className="w-full border rounded p-2 mb-4 text-black"
            />

            <label className="block mb-2 font-semibold">Phone Number</label>
            <input
              type="tel"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              placeholder="0821234567"
              className="w-full border rounded p-2 mb-4 text-black"
            />

            <label className="block mb-2 font-semibold">Date & Time</label>
            <input
              type="datetime-local"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="w-full border rounded p-2 mb-4 text-black"
            />

            <label className="block mb-2 font-semibold">Staff</label>
            <select
              value={newStaff}
              onChange={(e) => setNewStaff(e.target.value)}
              className="w-full border rounded p-2 mb-4 text-black"
            >
              {staff.map((s) => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>

            <label className="block mb-2 font-semibold">Service</label>
            <select
              value={newService}
              onChange={(e) => setNewService(e.target.value)}
              className="w-full border rounded p-2 mb-4 text-black"
            >
              {services.map((s) => (
                <option key={s.id} value={s.name}>{s.name} - R{s.price}</option>
              ))}
            </select>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setAdding(false)}
                className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleAddBooking}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Add Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md text-black">
            <h2 className="text-xl font-bold mb-4">Edit Appointment</h2>
            <p className="mb-4 text-gray-700">Customer: {editing.customer_name}</p>
            
            <label className="block mb-2 font-semibold">Date & Time</label>
            <input
              type="datetime-local"
              value={editTime}
              onChange={(e) => setEditTime(e.target.value)}
              className="w-full border rounded p-2 mb-4 text-black"
            />

            <label className="block mb-2 font-semibold">Staff</label>
            <select
              value={editStaff}
              onChange={(e) => setEditStaff(e.target.value)}
              className="w-full border rounded p-2 mb-4 text-black"
            >
              {staff.map((s) => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>

            <label className="block mb-2 font-semibold">Service</label>
            <select
              value={editService}
              onChange={(e) => setEditService(e.target.value)}
              className="w-full border rounded p-2 mb-4 text-black"
            >
              {services.map((s) => (
                <option key={s.id} value={s.name}>{s.name} - R{s.price}</option>
              ))}
            </select>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setEditing(null)}
                className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}