# Quién es Quién Wiki API

Currently Quién es Quién Wiki API is Read Only.

You man construct your query using any fields available on the schema as
well as filter by any of them.

 * https://www.quienesquien.wiki/schema

## Url Parameters

  * query by any field name available on the schema (i.e. names=Accel%20SAB%20de%20CV)
  * **fields**: limit returned fields to this comma separated list (i.e. &fields=name,description). Result set will contain only those documents where the givin field is present.
  * **text**: use text search (true|false).
  * **phrase**: search for complete phrase (true|false)
  * **sort**: sort by field (add **sortd** to determine sort direction)
  * **sortd**: determine direction of sort (1: ascending, -1: decending)
  * **limit**: limit numer of results (default: 100)
  * **skip**: skip ahead by this many documents
  * **gt**: greater than some dates (combine with *lt* for a range, requires *start_date* or *end_date*)
  * **lt**: less than some date (combine with *gt* for a range, requires *start_date* or *end_date*)

## Authentication

Write operations (PUT, POST, PATCH, DELETE) require credentials in the form of a valid user and formal approval from QuienEsQuien.Wiki administration. You can get these [here](https://www.quienesquien.wiki/). Read operations (GET) is openly available to third parties.

## Examples

We recommend the use of [node-qqw](https://github.com/ProjectPODER/node-qqw) for querying or updating QuienEsQuien.Wiki data. But here are a few exampls of querying data with curl.

### Persons

    curl -q 'http://localhost:3000/api/v1/persons?name=Carlos%20A.%20Motta'
    curl -q 'http://localhost:3000/api/v1/persons?name=Carlos%20A.%20Motta&fields=name,memberships.name'
    curl -q 'http://localhost:3000/api/v1/persons?name=carlos&fields=name,memberships.name&text=true'
    curl -q 'http://localhost:3000/api/v1/persons?name=carlos&fields=name&phrase=true'

### Organizations

    curl -q 'http://localhost:3000/api/v1/organizations?names=Accel%20SAB%20de%20CV'
    curl -q 'http://localhost:3000/api/v1/organizations?names=accel&fields=name,description&text=true'
    curl -q 'http://localhost:3000/api/v1/organizations?names=accel&fields=name&phrase=true'

### Contracts

    curl -q 'http://localhost:3000/api/v1/contracts?title=CONTRATACIÓN%20DEL%20SERVICIO%20DE%20RED%20LOCAL'
    curl -q 'http://localhost:3000/api/v1/contracts?title=Red%20Local&fields=title,dependency&text=true'
    curl -q 'http://localhost:3000/api/v1/contracts?Red%20Local=accel&fields=title&phrase=true'

#### query on range of dates

    curl -q 'http://localhost:3000/api/v1/contracts?start_date&gt=2014-04-20&lt=2014-4-30&sort=end_date&limit=100000'

## Text and Phrase

`text` and `phrase` parameters will add the `score` field to each returned object. Results are sorted by score.
