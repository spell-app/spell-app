import type { MeAnswer, PersonChanges } from "spell-app/spaces/models/people"
import { LOCAL_PERSON } from "spell-app/spaces/models/projectGroups"
import environment from "spell-app/spaces/server/node/environment"
import { respondWithJSON } from "spell-app/spaces/server/node/projects/response-utils"
import { DiskStorage } from "spell-app/spaces/server/node/storage/DiskStorage"
import { PeopleStore } from "./PeopleStore"

/**
 * People's routes, under `/api/people/` (epic `people-and-orgs` P9):  what the app's "You" panel reads and saves.
 * - `GET /api/people/me`:  this machine's person, their orgs and roles (read only),
 *   and what their files got wrong (`MeAnswer`).
 *   - The first time, it writes their starter `__me.json5`, from git's name and email.
 * - `POST /api/people/me`, body `PersonChanges`:  changes them, and writes their file with its comments kept.
 *   - It answers as `GET` does.
 * - This machine's person is `SPACES.LOCAL_PERSON` of spell's own org, `owen@spell`, for now.
 * - Nobody's refused a save (J46):  the permissions UI is todo T8.
 */

/** The ONE people store, on spell-spaces:  made on the first call. */
let store: PeopleStore | undefined

/** The people store on spell-spaces (`environment.spellSpacesDir`):  `SPELL_SPACES_DIR`, or the page server's `--spaces`. */
export function peopleStore(): PeopleStore {
  return (store ??= new PeopleStore(new DiskStorage(environment.spellSpacesDir)))
}

/** This machine's person, as `GET /api/people/me` answers:  their file made first if there's none. */
async function meAnswer(changes?: PersonChanges): Promise<MeAnswer> {
  const people = peopleStore()
  const { person } = await people.me(LOCAL_PERSON)
  if (changes) await people.change(person, changes)
  const { person: read, problems } = await people.person(LOCAL_PERSON)
  return { person: people.view(read ?? person), orgs: await people.rolesOf(read ?? person), problems }
}

/** `GET /api/people/me`:  see the file's docs. */
export const request_getMe = respondWithJSON(async () => meAnswer())

/** `POST /api/people/me`:  see the file's docs. */
export const request_saveMe = respondWithJSON(async (request) => meAnswer(request.body as PersonChanges))
