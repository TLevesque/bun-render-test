export default async function handler(req) {
  const now = new Date();

  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const day = {
    dayOfWeek: {
      name: days[now.getDay()],
      short: days[now.getDay()].substring(0, 3),
      number: now.getDay(),
    },
    dayOfMonth: now.getDate(),
    dayOfYear: Math.floor(
      (now - new Date(now.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24
    ),
    month: {
      name: months[now.getMonth()],
      short: months[now.getMonth()].substring(0, 3),
      number: now.getMonth() + 1,
    },
    year: now.getFullYear(),
    isWeekend: now.getDay() === 0 || now.getDay() === 6,
    formatted: {
      short: now.toLocaleDateString("en-US"),
      long: now.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      iso: now.toISOString().split("T")[0],
    },
    week: getWeekNumber(now),
  };

  return new Response(JSON.stringify(day, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

// Helper function to get week number
function getWeekNumber(date) {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}
