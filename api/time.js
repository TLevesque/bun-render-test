export default async function handler(req) {
  const now = new Date();

  // Format time in different ways
  const time = {
    unix: Math.floor(now.getTime() / 1000),
    iso: now.toISOString(),
    utc: now.toUTCString(),
    local: now.toLocaleString(),
    hours: now.getHours(),
    minutes: now.getMinutes(),
    seconds: now.getSeconds(),
    milliseconds: now.getMilliseconds(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    formatted: {
      time12: now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }),
      time24: now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }),
    },
  };

  return new Response(JSON.stringify(time, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
