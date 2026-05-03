'use client'

import { useState, useEffect, use } from 'react'
import { createClient } from '@supabase/supabase-js'

export default function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)

  const [business, setBusiness] = useState<any>(null)
  const [services, setServices] = useState<any[]>([])
  const [staff, setStaff] = useState<any[]>([])
  const [selectedService, setSelectedService] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const [selectedStaff, setSelectedStaff] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [saving, setSaving] = useState(false)

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    async function loadData() {
      const { data: businessData } = await supabase
       .from('businesses')
       .select('*')
       .eq('slug', slug)
       .single()

      if (!businessData) {
        setLoading(false)
        return
      }
      setBusiness(businessData)

      const { data: servicesData } = await supabase
       .from('services')
       .select('*')
       .eq('business_id', businessData.id)
       .order('price', { ascending: true })

      setServices(servicesData || [])

      const { data: staffData } = await supabase
       .from('staff')
       .select('*')
       .eq('business_id', businessData.id)

      setStaff(staffData || [])
      setLoading(false)
    }
    loadData()
  }, [slug])

  if (loading) return <div style={{ padding: '24px' }}>Loading...</div>
  if (!business) return <div style={{ padding: '24px' }}>Business not found</div>

  return (
    <div style={{ minHeight: '100vh', background: 'white', padding: '24px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '8px', color: 'black' }}>
          {business.name}
        </h1>
        <p style={{ color: 'green', fontWeight: 'bold', marginBottom: '32px' }}>
          ✓ Connected to Supabase
        </p>

        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: 'black' }}>
          Services
        </h2>

        <div style={{ display: 'grid', gap: '16px' }}>
          {services.map((service) => (
            <div key={service.id} style={{ border: '1px solid lightgray', borderRadius: '8px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'black' }}>{service.name}</h3>
                <p style={{ color: 'dimgray' }}>R{service.price} · {service.duration_minutes} min</p>
              </div>
              <button
                onClick={() => setSelectedService(service)}
                style={{ background: 'black', color: 'white', padding: '10px 20px', borderRadius: '6px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Book
              </button>
            </div>
          ))}
        </div>

        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '40px', marginBottom: '16px', color: 'black' }}>
          Staff
        </h2>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {staff.map((person) => (
            <div key={person.id} style={{ border: '1px solid lightgray', borderRadius: '8px', padding: '12px 20px' }}>
              <p style={{ fontWeight: 'bold', color: 'black' }}>{person.name}</p>
            </div>
          ))}
        </div>

        {selectedService && (
          <div
            onClick={() => setSelectedService(null)}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{ background: 'white', padding: '24px', borderRadius: '8px', maxWidth: '450px', width: '90%', color: 'black' }}
            >
              <h3 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '8px' }}>
                Book {selectedService.name}
              </h3>
              <p style={{ color: 'dimgray', marginBottom: '20px' }}>
                R{selectedService.price} · {selectedService.duration_minutes} min
              </p>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px' }}>Your Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid lightgray' }}
                  placeholder="Lucas"
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px' }}>Phone</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid lightgray' }}
                  placeholder="0821234567"
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px' }}>Choose Staff</label>
                <select
                  value={selectedStaff}
                  onChange={(e) => setSelectedStaff(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid lightgray' }}
                >
                  <option value="">Any available</option>
                  {staff.map((person: any) => (
                    <option key={person.id} value={person.id}>
                      {person.name} {person.specialty? `· ${person.specialty}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px' }}>Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid lightgray' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px' }}>Time</label>
                <input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid lightgray' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setSelectedService(null)}
                  style={{ background: 'lightgray', color: 'black', padding: '10px 20px', borderRadius: '6px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
onClick={async () => {
  if (!customerName ||!customerPhone ||!selectedDate ||!selectedTime) {
    alert('Fill in all fields')
    return
  }

  setSaving(true)

  // FIXED: Use SAST timezone
  const startTimeSAST = new Date(`${selectedDate}T${selectedTime}:00+02:00`)
  const endTimeSAST = new Date(startTimeSAST.getTime() + selectedService.duration_minutes * 60000)

  const startTimeUTC = startTimeSAST.toISOString()
  const endTimeUTC = endTimeSAST.toISOString()

  let finalStaffId = selectedStaff || null

  // 1. AUTO-ASSIGN STAFF IF "Any available" picked
  if (!selectedStaff) {
    const staffIds = staff.map((s: any) => s.id)

    const { data: busyStaff } = await supabase
     .from('appointments')
     .select('staff_id')
     .in('staff_id', staffIds)
     .lt('start_time', endTimeUTC)
     .gt('end_time', startTimeUTC)

    const busyStaffIds = busyStaff?.map((b: any) => b.staff_id) || []
    const availableStaff = staff.filter((s: any) =>!busyStaffIds.includes(s.id))

    if (availableStaff.length === 0) {
      setSaving(false)
      alert('Sorry, no staff available at that time. Pick another time.')
      return
    }

    finalStaffId = availableStaff[0].id
  }
  // 2. IF SPECIFIC STAFF PICKED, CHECK CONFLICT
  else {
    const { data: conflicts } = await supabase
     .from('appointments')
     .select('id')
     .eq('staff_id', selectedStaff)
     .lt('start_time', endTimeUTC)
     .gt('end_time', startTimeUTC)

    if (conflicts && conflicts.length > 0) {
      setSaving(false)
      alert('Sorry, that time is already booked for this staff member. Pick another time.')
      return
    }
  }

  // 3. INSERT WITH ASSIGNED STAFF
  const { error } = await supabase
   .from('appointments')
   .insert({
      business_id: business.id,
      service_id: selectedService.id,
      staff_id: finalStaffId,
      customer_name: customerName,
      customer_phone: customerPhone,
      start_time: startTimeUTC,
      end_time: endTimeUTC
    })

  setSaving(false)

  if (error) {
    alert('Error: ' + error.message)
  } else {
    const assignedStaffName = staff.find((s: any) => s.id === finalStaffId)?.name || 'staff'
    alert(`Booked with ${assignedStaffName}!`)
    setSelectedService(null)
    setCustomerName('')
    setCustomerPhone('')
    setSelectedDate('')
    setSelectedTime('')
    setSelectedStaff('')
  }
}}                >
                  {saving? 'Saving...' : 'Confirm Booking'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}