import {
  isEmpty
} from 'lodash';

export function contractSearchOperator(baseQuery, data) {
  const query = [];
  var searchOperator = {};
  if (baseQuery) {
    query.push(baseQuery);
  }

  const type = data.get('type');
  const minAmount = data.get('min_amount');
  const maxAmount = data.get('max_amount');
  const unkownAmount = data.get('unkown_amount');
  const minDate = data.get('min_date');
  const maxDate = data.get('max_date');
  const unkownDate = data.get('unknown_date');
  const supplier = data.get('supplier');

  if (type && !/all/i.test(type)) {
    query.push({
      $or: [
        {
          type: {
            $regex: type,
            $options: 'i',
          },
        },
        {
          type: {
            $exists: false,
          },
        },
      ],
    });
  }
  if (maxAmount) {
    const operator = unkownAmount ? "$or" : "$and"

    const q = {}

    q[operator] = [
      {
        "contracts.0.value.amount": {
          $lte: maxAmount,
        },
      },
      {
        "contracts.0.value.amount": {
          $exists: !unkownAmount,
        },
      },
    ]

    query.push(q);
  }
  if (minAmount) {
    const operator = unkownAmount ? "$or" : "$and"

    const q = {}

    q[operator] = [
      {
        "contracts.0.value.amount": {
          $gte: minAmount,
        },
      },
      {
        "contracts.0.value.amount": {
          $exists: !unkownAmount,
        },
      },
    ];

    query.push(q);
  }
  if (minDate) {
    const operator = unkownDate ? "$or" : "$and"

    const q = {}

    q[operator] = [
      {
        "contracts.period.startDate": {
          $gte: minDate,
        },
      },
      {
        "contracts.period.startDate": {
          $exists: !unkownDate,
        },
      },
    ]

    query.push(q);
  }
  if (maxDate) {
    const operator = unkownDate ? "$or" : "$and"

    const q = {}

    q[operator] = [
      {
        "contracts.0.period.startDate": {
          $lte: maxDate,
        },
      },
      {
        "contracts.0.period.startDate": {
          $exists: !unkownDate,
        },
      },
    ]

    query.push(q);
  }

  if (!isEmpty(query)) {
    searchOperator = { $and: query };
  }
  return searchOperator;
}
