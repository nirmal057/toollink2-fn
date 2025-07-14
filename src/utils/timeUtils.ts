export const BUSINESS_HOURS = {
  start: '09:00',
  end: '17:00'
};

export const isWithinBusinessHours = (time: string): boolean => {
  const [hours] = time.split(':').map(Number);
  return hours >= 9 && hours < 17;
};

export const getAvailableTimeSlots = (): string[] => {
  const slots: string[] = [];
  for (let hour = 9; hour < 17; hour++) {
    slots.push(`${String(hour).padStart(2, '0')}:00`);
  }
  return slots;
};

export const createDeliveryTimeSlot = (time: string): string => {
  if (!isWithinBusinessHours(time)) {
    throw new Error('Selected time must be within business hours (9 AM - 5 PM)');
  }

  const addHours = (timeStr: string, hours: number): string => {
    const [h, m] = timeStr.split(':').map(Number);
    const newHour = (h + hours) % 24;
    return `${String(newHour).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };
  
  const endTime = addHours(time, 2);
  // Check if the delivery slot extends beyond business hours
  if (!isWithinBusinessHours(endTime)) {
    throw new Error('Delivery slot must end within business hours');
  }
  
  return `${time}-${endTime}`;
};
