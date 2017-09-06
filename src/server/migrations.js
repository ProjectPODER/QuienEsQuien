import {
  Migrations,
} from 'meteor/percolate:migrations';
import {
  extend,
  omit,
  isEmpty,
} from 'lodash';
import {
  Orgs,
} from '../imports/api/organizations/organizations';
import {
  Persons,
} from '../imports/api/persons/persons';
import {
  Memberships,
} from '../imports/api/memberships/memberships';
import {
  Contracts,
} from '../imports/api/contracts/contracts';
import {
  simpleName,
} from '../imports/api/lib';
import {
  genOCDID,
} from '../imports/api/parse/server/lib';

export const ProbablyNotPersons = new Mongo.Collection('pnp');

// FIXME factor out of meteor and use
// https://github.com/emmanuelbuah/mgdb-migrator

// TODO
// * add memberships relating dependencies to departments
// * set category attribute according to .public or .company
// * merge documents by simple

Migrations.add({
  name: 'add simple, names array',
  version: 1,
  up() {
    [Orgs, Persons].forEach((Ent) => {
      Ent.find({
        simple: {
          $exists: false,
        },
      })
        .forEach((org) => {
          const simple = simpleName(org.name);
          Ent.update(org._id, {
            $set: {
              simple,
            },
          });
        });

      Ent.find({
        names: {
          $exists: false,
        },
      })
        .forEach((org) => {
          const names = [name];
          Ent.update(org._id, {
            $set: {
              names,
            },
          });
        });
    });
  },
  down() {
    [Orgs, Persons].forEach((Ent) => {
      Ent.update({}, {
        $unset: {
          simple: true,
          names: true,
        },
      }, {
        multi: true,
      });
    });
  },
});

Migrations.add({
  name: 'move orgs board memberships to membership collection',
  version: 2,
  up() {
    [Orgs, Persons].forEach((Ent) => {
      // FIXME are there cases where a member exists on the org but not on the person????
      Ent.find({
        memberships: {
          $exists: true,
        },
      })
        .forEach((doc) => {
          doc.memberships.forEach((member) => {
            if (member.role !== 'Responsible of Compranet') {
              member.department = 'board';
            }

            if (Ent._name === 'organizations') {
              // `sob_org` has board member `person`
              member.sob_org = doc.simple;
              member.person_id = simpleName(member.name);
              member.person = member.name;
            } else if (Ent._name === 'persons') {
              // `sob_org` has board member `person`
              member.sob_org = simpleName(member.name);
              member.person_id = doc.simple;
              member.person = doc.name;
            } else {
              throw Error('Unknown Collection');
            }
            const setter = {
              $setOnInsert: member,
            };
            if (doc.user_id) {
              setter.$set = { user_id: doc.user_id };
            }
            delete member.name;
            const r = Memberships.rawCollection().findAndModify(
              member,
              [],
              setter,
              {
                upsert: true,
                new: true,
              }
            );
          });
          Ent.update(doc._id, {
            $unset: {
              memberships: true,
            },
          });
        });
    });
  },
  down() {
    Memberships.find({})
      .forEach((m) => {
        if (m.person) {
          Persons.update(m.person_id, {
            $addToSet: m,
          });
        }
        if (m.org) {
          Orgs.update(m.org_id, {
            $addToSet: m,
          });
        }
      });
    Memberships.rawCollection()
      .drop();
  },
});

Migrations.add({
  // each document in owned_by array is a shareholder
  // shareholders belong to the the organization of which they hold shares
  // Org.simple: membership.sob_org
  // shareholder.name: membership.org_id or membership.person_id
  // a membership of role 'shareholder' with org_id of x
  // means x holds shares in sob_org
  name: 'move owned_by to membership collection',
  version: 3,
  up() {
    Orgs.find({
      owned_by: {
        $exists: true,
      },
    })
    .forEach((doc) => {
      doc.owned_by.forEach((shareholder) => {
        shareholder.sob_org = doc.simple;
        shareholder.role = 'shareholder';
        if (doc.user_id) {
          shareholder.user_id = doc.user_id;
        }
        // figure out if shareholder is person or org
        const person = Persons.findOne({
          simple: simpleName(shareholder.name),
        });
        if (person) {
          shareholder.person = shareholder.name;
          shareholder.person_id = simpleName(shareholder.name);
        } else {
          shareholder.org = shareholder.name;
          shareholder.org_id = simpleName(shareholder.name);
        }
        const setter = {
          $setOnInsert: omit(shareholder, ['shares', 'name']),
        };
        const set = {};
        if (shareholder.shares) {
          extend(set, { shares: shareholder.shares });
        }
        if (doc.user_id) {
          extend(set, { user_id: doc.user_id });
        }
        if (!isEmpty(set)) {
          setter.$set = set;
        }
        delete shareholder.shares;
        delete shareholder.name;
        const r = Memberships.rawCollection().findAndModify(
          shareholder,
          [],
          setter,
          {
            upsert: true,
            new: true,
          },
        );
      });
      Orgs.update(doc._id, {
        $unset: {
          owned_by: true,
        },
      });
    });
  },
  down() {
    Memberships.find({
      role: 'shareholder',
    })
    .forEach((m) => {
      m.name = m.org_id;
      delete m.role;
      if (m.holder_person) {
        const simple = m.holder_person;
        delete m.sob_person;
        delete m.org_id;
        Persons.update({
          simple,
        }, {
          $addToSet: {
            owned_by: m,
          },
        });
      }
      if (m.sob_org) {
        const simple = m.holder_org;
        delete m.sob_org;
        delete m.org_id;
        Orgs.update({
          simple,
        }, {
          $addToSet: {
            owned_by: m,
          },
        });
      }
    });
    Memberships.remove({
      role: 'shareholder',
    });
  },
});

Migrations.add({
  // items in array ``owns`` are the shares that doc owns in other orgs
  // therefore doc is the org_id and shareholder.name is sob_org
  name: 'move owns to membership collection',
  version: 4,
  up() {
    [Orgs, Persons].forEach((Ent) => {
      Ent.find({
        owns: {
          $exists: true,
        },
      })
      .forEach((doc) => {
        doc.owns.forEach((shareholder) => {
          shareholder.role = 'shareholder';

          const person = Persons.findOne({
            simple: simpleName(shareholder.name),
          });
          if (person) {
            console.log(`Person (${shareholder.name}) may not be owned`);
            ProbablyNotPersons.insert(shareholder);
          }

          shareholder.sob_org = simpleName(shareholder.name);

          if (doc.user_id) {
            shareholder.user_id = doc.user_id;
          }

          if (Ent._name === 'organizations') {
            // Ent i.e. `doc` is the shareholder
            shareholder.org_id = doc.simple;
            shareholder.org = doc.name;
          }

          if (Ent._name === 'persons') {
            // Ent i.e. `doc` is the shareholder
            shareholder.person = doc.name;
            shareholder.person_id = doc.simple;
          }
          const setter = {
            $setOnInsert: omit(shareholder, ['shares', 'name']),
          };
          const set = {};
          if (shareholder.shares) {
            extend(set, { shares: shareholder.shares });
          }
          if (doc.user_id) {
            extend(set, { user_id: doc.user_id });
          }
          if (!isEmpty(set)) {
            setter.$set = set;
          }
          delete shareholder.shares;
          delete shareholder.name;
          const r = Memberships.rawCollection().findAndModify(
            shareholder,
            [],
            setter,
            {
              upsert: true,
              new: true,
            },
          );
        });
        Ent.update(doc._id, {
          $unset: {
            owns: true,
          },
        });
      });
    });
  },
  down() {
    Memberships.find({
      role: 'shareholder',
    })
    .forEach((m) => {
      m.name = m.org_id;
      delete m.role;
      if (m.holder_person) {
        const simple = m.holder_person;
        delete m.sob_person;
        delete m.org_id;
        Persons.update({
          simple,
        }, {
          $addToSet: {
            owns: m,
          },
        });
      }
      if (m.sob_org) {
        const simple = m.holder_org;
        delete m.sob_org;
        delete m.org_id;
        Orgs.update({
          simple,
        }, {
          $addToSet: {
            owns: m,
          },
        });
      }
    });
    Memberships.remove({
      role: 'shareholder',
    });
  },
});

Migrations.add({
  name: 'move company.parent to top level',
  version: 5,
  up() {
    Orgs.find({
      'company.parent': {
        $exists: true,
      },
    })
    .forEach((doc) => {
      Orgs.update(doc._id, {
        $set: {
          parent: [doc.company.parent.name],
        },
        $unset: {
          'company.parent': true,
        },
      });
    });
  },
  down() {
    Orgs.find({
      parent: {
        $exists: true,
      },
    })
    .forEach((doc) => {
      Orgs.update({
        _id: doc._id,
      }, {
        $set: {
          'company.parent.name': doc.parent[0],
        },
      });
    });
  },
});

Migrations.add({
  name: 'Address (telephone => phone)',
  version: 6,
  up() {
    // address.telepone => address.phone
    [Persons, Orgs].forEach((entity) => {
      entity.find({
        'address.telephone': {
          $exists: true,
        },
      })
      .forEach((doc) => {
        entity.update(doc._id, {
          $set: {
            'address.phones': [doc.address.telephone],
          },
          $unset: {
            'address.telephone': true,
          },
        });
      });
    });
  },
  down() {
    // address.phones[0] => address.telephone
    [Persons, Orgs].forEach((entity) => {
      entity.find({
        'address.phones': {
          $exists: true,
        },
      })
      .forEach((doc) => {
        entity.update(doc._id, {
          $set: {
            'address.telephone': doc.address.phones[0],
          },
          $unset: {
            'address.phones': true,
          },
        });
      });
    });
  },
});

Migrations.add({
  name: 'Address +OCDID',
  version: 7,
  up() {
    [Persons, Orgs].forEach((entity) => {
      entity.find({
        $and: [{
          'address.country': {
            $exists: true,
          },
        },
        {
          'address.state': {
            $exists: true,
          },
        },
        {
          'address.city': {
            $exists: true,
          },
        },
        ],
      })
      .forEach((doc) => {
        entity.update(doc._id, {
          $set: {
            'address.ocd_id': genOCDID(doc.address),
          },
        });
      });
    });
  },
  down() {
    [Persons, Orgs].forEach((entity) => {
      entity.find({
        ocd_id: {
          $exists: true,
        },
      })
      .forEach((doc) => {
        entity.update(doc._id, {
          $unset: {
            'address.ocd_id': true,
          },
        });
      });
    });
  },
});

Migrations.add({
  name: 'Contracts procedure_number => ocid',
  version: 8,
  up() {
    Contracts.find({
      procedure_number: {
        $exists: true,
      },
    })
      .forEach((contract) => {
        const ocid = `ocds-0ud2q6-${contract.procedure_number}`;
        Contracts.update(contract._id, {
          $set: {
            ocid: ocid.toUpperCase(),
          },
          $unset: {
            procedure_number: true,
          },
        });
      });
  },
  down() {
    Contracts.find({
      ocid: {
        $exists: true,
      },
    })
      .forEach((contract) => {
        Contracts.update(contract._id, {
          $set: {
            procedure_number: contract.ocid.replace(/^OCDS-0UD2 Q6-/, ''),
          },
          $unset: {
            ocid: true,
          },
        });
      });
  },
});

Migrations.add({
  name: 'Contracts (references)',
  version: 9,
  up() {
    // references [] / [{url}]
    Contracts.find({
      $and: [{
        references: { $exists: true },
        'references.url': { $exists: false },
      }],
    })
    .forEach((contract) => {
      Contracts.update(contract._id, {
        $set: {
          references: [{
            url: contract.references[0].replace(/.*?:\/\//g, ''),
          }],
        },
      });
    });
  },
  down() {
    Contracts.find({
      'references.url': {
        $exists: true,
      },
    })
      .forEach((contract) => {
        Contracts.update(contract._id, {
          $set: {
            references: [
              contract.references.url,
            ],
          },
        });
      });
  },
});

Migrations.add({
  name: 'Contracts (proveedor=>suppliers)',
  version: 10,
  up() {
    // proveedor/suppliers, suppliers_org, suppliers_person
    Contracts.find({
      proveedor: {
        $exists: true,
      },
    })
      .forEach((contract) => {
        const supplier = simpleName(contract.proveedor);
        const setter = {};
        const org = Orgs.findOne({
          simple: supplier,
        });

        if (org) {
          setter.suppliers_org = [supplier];
        }

        const person = Persons.findOne({
          simple: supplier,
        });

        if (person) {
          setter.suppliers_person = [supplier];
        }

        if (!org && !person) {
          setter.suppliers = [supplier];
        }
        console.log(setter);

        Contracts.update(contract._id, {
          $set: setter,
          $unset: {
            proveedor: true,
          },
        });
      });
  },
  down() {
    Contracts.find({
      suppliers: {
        $exists: true,
      },
    })
      .forEach((contract) => {
        const supplier = contract.supplier[0];

        Contracts.update(contract._id, {
          $set: {
            proveedor: supplier,
          },
          $unset: {
            suppliers: true,
          },
        });
      });
    Contracts.find({
      suppliers_org: {
        $exists: true,
      },
    })
      .forEach((contract) => {
        const supplier = contract.suppliers_org[0];

        Contracts.update(contract._id, {
          $set: {
            proveedor: supplier,
          },
          $unset: {
            suppliers_org: true,
          },
        });
      });
    Contracts.find({
      suppliers_person: {
        $exists: true,
      },
    })
      .forEach((contract) => {
        const supplier = contract.suppliers_person[0];

        Contracts.update(contract._id, {
          $set: {
            proveedor: supplier,
          },
          $unset: {
            suppliers_person: true,
          },
        });
      });
  },
});

// Migrations.add({
//   name: 'remove country from Contracts',
//   version: 11,
//   up() {
//     // remove country from contracts
//
//     Contracts.find({
//       country: {
//         $exists: true,
//       },
//     }).forEach((contract) => {
//       if (contract.suppliers_org) {
//         Orgs.update({
//           $and: [{
//             simple: contract.suppliers_org,
//           },
//           {
//             'address.country': {
//               $exists: false,
//             },
//           },
//           ],
//         }, {
//           $set: {
//             'address.country': contract.country,
//           },
//         });
//       }
//       Contracts.update(contract._id, {
//         $unset: {
//           country: true,
//         },
//       });
//     });
//   },
// });
