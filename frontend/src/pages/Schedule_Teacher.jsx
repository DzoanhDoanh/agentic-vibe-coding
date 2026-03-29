import React, { useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Button } from 'antd';

const localizer = momentLocalizer(moment);
const Schedule_Teacher = () => {
  const [events] = useState([
    {
      title: 'Lớp Toán 10 (A1)',
      start: new Date(new Date().setHours(18, 0, 0, 0)),
      end: new Date(new Date().setHours(19, 30, 0, 0)),
    },
    {
      title: 'Anh Văn Giao Tiếp',
      start: new Date(new Date().setHours(20, 0, 0, 0)),
      end: new Date(new Date().setHours(21, 30, 0, 0)),
    }
  ]);

  return (
    <div style={{ height: '75vh', background: '#fff' }}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <h2>Lịch Yêu cầu Cá nhân (Giáo viên)</h2>
      </div>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%', marginTop: '20px' }}
      />
    </div>
  );
};
export default Schedule_Teacher;
