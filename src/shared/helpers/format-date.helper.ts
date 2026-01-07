type date = {
  start_date: Date;
  end_date: Date;
};

export const formatDate = (
  start_date: any,
  end_date: any,
  timezone = '-4',
): date => {
  let filter: date = {
    start_date,
    end_date,
  };

  if (!start_date && !end_date) return filter;

  const timeZone = timezone.match(/^-[0-9]$/i) ? timezone : '-4';

  const createDateTime = (dateTime: any) => {
    const [datePart, timePart] = dateTime.split(' ');

    const [year, month, day] = datePart.split('-');
    const [hours = '00', minutes = '00'] = timePart ? timePart.split(':') : [];

    return new Date(
      `${month}-${day}-${year} ${hours}:${minutes}:00${timeZone}`,
    );
  };

  if (start_date === end_date) {
    filter.start_date = createDateTime(start_date);
    filter.end_date = new Date(filter.start_date.getTime() + 86399000);
  } else {
    filter.start_date = createDateTime(start_date);
    filter.end_date = createDateTime(end_date);
  }

  return filter;
};

export const setHour = (hour) => {
  const now = new Date(hour);

  // Establecer los minutos, segundos y milisegundos a cero
  now.setMinutes(0);
  now.setSeconds(0);
  now.setMilliseconds(0);

  // Convertir a formato ISO 8601
  const isoString = now.toISOString();

  return isoString;
};
