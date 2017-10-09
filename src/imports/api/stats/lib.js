import { extend } from 'lodash';
import Stats from './stats';

function statsSelector(date) {
  return {
    hour: date.getHours(),
    day: date.getDate(),
    month: date.getMonth(),
    year: date.getYear(),
  };
}

function baseMod(date) {
  return {
    $setOnInsert: {
      created_at: date,
    },
    $set: {
      updated_at: date,
    },
  };
}

export function statOrgUpdate(id) {
  const date = new Date();
  const modifier = baseMod(date);
  const selector = statsSelector(date);

  if (id) {
    extend(modifier, {
      $addToSet: {
        orgs: id,
      },
      $inc: {
        org_inserts: 1,
      },
    });
  } else {
    extend(modifier, {
      $inc: {
        org_updates: 1,
      },
    });
  }

  Stats.upsert(
    selector,
    modifier,
  );
}

export function statPersonUpdate(id) {
  const date = new Date();
  const modifier = baseMod(date);
  const selector = statsSelector(date);

  if (id) {
    extend(modifier, {
      $addToSet: {
        persons: id,
      },
      $inc: {
        person_inserts: 1,
      },
    });
  } else {
    extend(modifier, {
      $inc: {
        person_updates: 1,
      },
    });
  }

  Stats.upsert(
    selector,
    modifier,
  );
}

export function statContractUpdate(id) {
  const date = new Date();
  const modifier = baseMod(date);
  const selector = statsSelector(date);

  if (id) {
    extend(modifier, {
      $addToSet: {
        contracts: id,
      },
      $inc: {
        contract_inserts: 1,
      },
    });
  } else {
    extend(modifier, {
      $inc: {
        contract_updates: 1,
      },
    });
  }

  Stats.upsert(
    selector,
    modifier,
  );
}

export function statOrgRemove(id) {
  const date = new Date();
  const modifier = baseMod(date);
  const selector = statsSelector(date);

  extend(modifier, {
    $addToSet: {
      deleted_orgs: id,
    },
    $inc: {
      org_deletes: 1,
    },
  });

  Stats.upsert(
    selector,
    modifier,
  );
}

export function statPersonRemove(id) {
  const date = new Date();
  const modifier = baseMod(date);
  const selector = statsSelector(date);

  extend(modifier, {
    $addToSet: {
      deleted_persons: id,
    },
    $inc: {
      person_deletes: 1,
    },
  });

  Stats.upsert(
    selector,
    modifier,
  );
}

export function statContractRemove(id) {
  const date = new Date();
  const modifier = baseMod(date);
  const selector = statsSelector(date);

  extend(modifier, {
    $addToSet: {
      deleted_contracts: id,
    },
    $inc: {
      contract_deletes: 1,
    },
  });

  Stats.upsert(
    selector,
    modifier,
  );
}
