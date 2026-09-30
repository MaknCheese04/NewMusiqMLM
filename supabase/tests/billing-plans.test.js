import test from 'node:test';
import assert from 'node:assert/strict';
import {BILLING_PLANS,trialEndTimestamp,matchesPlan} from '../functions/_shared/billing-plans.js';

test('advertised USD prices and trial lengths are fixed',()=>{
  assert.equal(BILLING_PLANS.listener.cents,500);
  assert.equal(BILLING_PLANS.listener.trialMonths,1);
  assert.equal(BILLING_PLANS.artist.cents,1000);
  assert.equal(BILLING_PLANS.artist.trialMonths,3);
});
test('calendar trials preserve time and clamp month ends, including leap years',()=>{
  for(const [start,months,end] of [
    ['2026-01-31T12:30:00Z',1,'2026-02-28T12:30:00Z'],
    ['2028-01-31T12:30:00Z',1,'2028-02-29T12:30:00Z'],
    ['2026-11-30T12:30:00Z',3,'2027-02-28T12:30:00Z'],
    ['2026-09-30T12:30:00Z',3,'2026-12-30T12:30:00Z'],
  ])assert.equal(trialEndTimestamp(start,months),Date.parse(end)/1000);
});
test('rejects wrong currency, amount, interval, lookup key, and inactive prices',()=>{
  const plan=BILLING_PLANS.listener;
  const valid={active:true,currency:'usd',unit_amount:500,lookup_key:plan.lookup,recurring:{interval:'month',interval_count:1}};
  assert.equal(matchesPlan(valid,plan),true);
  for(const change of [{currency:'eur'},{unit_amount:1000},{active:false},{lookup_key:BILLING_PLANS.artist.lookup},{recurring:{interval:'year',interval_count:1}},{recurring:{interval:'month',interval_count:3}}])assert.equal(matchesPlan({...valid,...change},plan),false);
});
