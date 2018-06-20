import {
  isEmpty
} from 'lodash';

export function contractSearchOperator(baseQuery, data) {
  console.log("hola");
  const query = [];
  var searchOperator = {};
  if (baseQuery) {
    query.push(baseQuery);
  }

  const type = data.get('type');
  const minAmount = data.get('min_amount');
  const maxAmount = data.get('max_amount');
  const minDate = data.get('min_date');
  const maxDate = data.get('max_date');
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
    query.push({
      $or: [
        {
          amount: {
            $lte: maxAmount,
          },
        },
        {
          amount: {
            $exists: false,
          },
        },
      ],
    });
  }
  if (minAmount) {
    query.push({
      $or: [
        {
          amount: {
            $gte: minAmount,
          },
        },
        {
          amount: {
            $exists: false,
          },
        },
      ],
    });
  }
  if (minDate) {
    query.push({
      $or: [
        {
          start_date: {
            $gte: minDate,
          },
        },
        {
          start_date: {
            $exists: false,
          },
        },
      ],
    });
  }
  if (maxDate) {
    query.push({
      $or: [
        {
          start_date: {
            $lte: maxDate,
          },
        },
        {
          start_date: {
            $exists: false,
          },
        },
      ],
    });
  }
  
  if (!isEmpty(query)) {
    searchOperator = { $and: query };
  }
  return searchOperator;
}
