import { Contracts } from '../contracts';
import exchangeRates from '../lib';

const rawContracts = Contracts.rawCollection();
rawContracts.aggregateSync = Meteor.wrapAsync(rawContracts.aggregate);

export function statAmountsByCurrency(query) {
  return rawContracts.aggregateSync([
    {
      $match: query,
    },
    { $group: {
      _id: '$currency',
      sum: { $sum: '$amount' },
      min: { $min: '$amount' },
      max: { $max: '$amount' },
    } },
  ]);
}

export function statMinMax(query) {
  var filters = [
    {
      $match: query,
    },
    { $group: {
      _id: null,
      date_min: { $min: '$start_date' },
      date_max: { $max: '$start_date' },
      amount_min: { $min: '$amount' },
      amount_max: { $max: '$amount' },
    },
    },
  ]
  console.log("statMinMax",filters,filters[0]["$group"].date_min,filters[0]["$group"].date_max);
  return rawContracts.aggregateSync(filters,{cursor: {}});
}

export function statAmountByYear(query) {
  return rawContracts.aggregateSync(
    [
      {
        $match: query,
      },
      { $sort: { start_date: -1 } },
      {
        $group: {
          // _id: { year: { $year: '$start_date' } },
          // FIXME use $year once all contracts have a $start_date
          _id: {
            year: { $substr: ['$start_date', 0, 4] },
            // year: { $year: '$start_date' },
          },
          values: { $push: { amount: '$amount', currency: '$currency' } },
          count: { $sum: 1 },
        },
      },
    ]).map((obj) => {
      const value = obj.values.reduce((acc, cur) => {
        if (!cur.amount) {
          return acc;
        }

        if (cur.currency === 'MXN' || cur.currency === 'TEST') {
          return acc + cur.amount;
        }

        const cambio = exchangeRates[cur.currency][obj._id.year];
        return acc + (cur.amount * cambio);
      }, 0);

      return {
        value,
        year: obj._id.year,
        count: obj.count,
      };
    });
}
