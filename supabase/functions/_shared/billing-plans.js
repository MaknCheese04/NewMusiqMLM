export const BILLING_PLANS = Object.freeze({
  listener: { name: 'Listener', cents: 500, trialMonths: 1, lookup: 'newmusiq_listener_usd_month_v1' },
  artist: { name: 'Artist', cents: 1000, trialMonths: 3, lookup: 'newmusiq_artist_usd_month_v1' },
});

// Calendar months, with Jan 31 -> Feb 28/29 rather than overflowing into March.
export function trialEndTimestamp(start, months) {
  const date = new Date(start);
  const day = date.getUTCDate();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() + months);
  const lastDay = new Date(Date.UTC(date.getUTCFullYear(),date.getUTCMonth()+1,0)).getUTCDate();
  date.setUTCDate(Math.min(day,lastDay));
  return Math.floor(date.getTime()/1000);
}

export function matchesPlan(price, plan) {
  return Boolean(price && plan && price.active && price.currency === 'usd' && price.unit_amount === plan.cents
    && price.recurring?.interval === 'month' && price.recurring.interval_count === 1 && price.lookup_key === plan.lookup);
}
