# Spell.app Project UI


## DECIDE
- How do we manage different "spell language" and "spell app" versions?
- Where/how do we manage "user files" separate from the downloadable app files?
- How do we manage the "user library"?


<span id="getting-started"></span>
## Getting Started

### For programmers:
- assume nodeJS set up locally
- `git clone ...spell-app`
- `yarn start`
- Use web UI to create projects, etc.
- Also usable as CLI (wrapper around same functions used by UI).

### Non-programmer local install
- Install as local app via Electron
- Use provided UI to create projects / etc

### Public access
- Create an account at `https://spell.app`
- Use that UI to create projects/etc.



<span id="ui"></span>
## UI Functionality
- Note that this is available both via a public url and as a local install (see [Getting Started](#getting-started))
- In public URLs below, `<version>` refers to published spell and/or project version, allowing you to see history of projects/etc.

<span id="guides"></span>
### Guides
- Guides are spell apps (projects) which teach you how to write spell programs.
- We'll have lightweight "playgrounds" within guides which allow you to play with examples inline within the page.
- `<version>` below reflects the [spell language version](#spell-language-versioning).  
    - It will generally be `current` to reflect the current language version in use.
    - However, you can look at an old version by providing an explicit version identifier.
- On a local install, an user create guides or edit existing ones and submit to the master spell project as [pull requests](#pull-requests).

| Description | Location |
|------|----------|
| Source     | `spell/guides/<version>/<guide-name>/...`
| Local URL  | `localhost/guides/<version>/<guide-name>/...`
| Public URL | `spell.app/guides/<version>/<guide-name>/...`


<span id="api-docs"></span>
### API Documentation
- Combined "dictionary" and "phrase book" for the spell language.
- Auto-generated from combination of markdown files and spell `Rule` descriptions and tests.
- Note that although this is presented differently to the user, this is implemented as a normal "guide app."

| Description | Location |
|------|----------|
| Source    | `spell/guides/<version>/api/...`
| Local URL | `localhost/guides/<version>/api/...`
| Public URL | `spell.app/guides/<version>/api/...`


<span id="example-apps"></span>
### Example apps
- Example apps are standalone spell projects provided with the system, as inspiration or to illustrate particular concepts.
- Examples run within the UI, and you can "view source" to see how things are put together.
- Users can "clone" an example app into their "projects" area to play with it or build off of it.
- Example apps are highly annotated so you can learn the why as well as the how.
    - **TODO**: "hide annotations" feature?
- Each example will include an "About Page" which explains the purpose of the example and interesting things to check out.
    - **TODO**: How to link to specific sections within the code?
- On a local install, examples can be changed and submitted to the project as [pull requests](#pull-requests).

| Description | Location |
|------|----------|
| Source Files | `spell/examples/<version>/<example-project>/...`
| Local URL | `localhost/examples/<version>/<example-project>...`
| Public URL | `spell.app/examples/<version>/<example-project>/...`


<span id="user-apps"></span>
### User apps (projects)
- A user's own apps/projects.  The user has complete freedom to create apps within this space.
- `<version>` below refers to the version of the project:
    - It will generally be `latest` to refer to the current version under development.
    - `public` refers to the latest published version, if any. See [Publishing user apps](#publishing-user-apps).
    - In local development:
        - `v2`, `v2.1`, `v2.1:23` refer to specific "major" / "minor" / "patch" versions, which are pulled from source control.
    - See [user project version number](#User-versioning).

| Description | Location |
|------|----------|
| Source | `<local-projects>/projects/<project>/<version>/...`
| Local URL | `localhost/projects/<project>/<version>/<page...>`
| Public URL | `<userid>.spell.app/projects/<project>/<version>/<page...>`
| | See also: [Publishing user apps](#publishing-user-apps)

**TODO**: Need to figure out file structure / source control strategy for user projects in relation to published spell source.


<span id="spell-store"></span>
### Spell store / user library
- We'll provide a "store" for SpellCo and other users to publish apps that users can download and possibly modify, by "adding the project to their **library**".
- Publishers can:
    - associate text / graphics / etc with their app in the store, respond to reviews, etc.
    - set a price for using the app.  ***SpellCo*** will get a cut of the publication price.
    - create a "companion app" that explains the functionality of the published app, provide a read-only version for users to play with, etc.  This is simply another "public" app that is linked to from the "store" app.
    - specify access rights that the user has to the application source:
        - **private source**:  User can use the app, but cannot inspect or modify source code.  The code is delivered to the user as obscured, compiled javascript.
        - **personal use only**:  User can inspect/modify the source code for personal use, but may not re-publish the package.  (NOTE: this may be difficult to enforce in practice).  Editing a project pulls it into the users own project workspace.  Edits made by a user to a project will not survive an upgrade to the project.
        - **publishable**:  User can freely modify and re-publish the source.
        - Note that publishers can specify different prices for different access rights:  e.g. personal use is free, re-publishing costs money.
- One major purpose of the store is to publish example apps that users can riff off of, beyond the "examples" published in the spell source code.
- Publishing an app to the store uses the same UI as [publishing user apps](#publishing-user-apps)
- Store apps are tied to the major spell versions set when they are published.  When a new major spell version is released, publishers can easily re-publish their app to work with that version (or pay SpellCo to recertify it for them).
    - **TODO**: Do we maintain old versions of the publisher app?
    
| Description | Who | Location |
|-------------|-----|----------|
| Source | user         | `<local-projects>/library/<publisher>/<project>/<version>/...`
|   | publisher         | `<local-projects>/projects/<project>/<version>/...`
| Local URL | user      | `localhost/library/<publisher>/<project>/<page...>`
|   | publisher         | `<local-projects>/projects/<project>/<version>/<page...>`
| Public URL | in store | `spell.app/store/<publisher>/<project>`
|   | companion-app     | `<publisher>.spell.app/projects/<project>/<page...>`
| Admin URL | publisher | `<publisher>.spell.app/project-settings/<project>`




<span id="publishing-user-apps"></span>
### Publishing user apps
- Users can "publish" apps for others to view from their `spell.app` account. A modest amount of traffic / data storage is included in the account, users pay extra for high usage or storage.
- When an app is published, the user will bump either the major or minor version number of the project, creating a "tag" in source control that they can work with (see [User project versioning](#User-versioning)).
- There is only one "public" version of an app available at a time (although users can view old versions locally).

| Description | Location |
|------|----------|
| Source                | `<local-projects>/projects/<project>/<version>/...`
| Publication admin URL | `<publisher>.spell.app/project-settings/<project>/...`
| Default public URL    | `<publisher>.spell.app/projects/<project>/<page...>`
| Custom domain URL     | `<custom-domain>/<page...>`
|                       | `<custom-domain>/<project>/<page...>` or
|                       | `<custom-domain>/<custom-prefix...>/<page...>`


## Specifics

<span id="spell-language-versioning"></span>
### Spell language versioning
- The spell **language** will follow [semVer 2.0](https://semver.org/) semantic versioning.
- Spell project files will note the spell language version used with that project.  
- After version 1.0, we will be very, very conservative in making breaking changes to the language as this will break user projects.
- When a new language version is available, a given project **may** choose to upgrade, or it may choose to stick on the older, known-to-be-good-version of the language.
- **TODO**:  Need to figure out how this applies to libraries used by the project.

##### Breaking language changes
- If a breaking change to the language syntax is required:
    - There will be at least a 6 month period while both the old and new syntaxes are valid, if at all possible.
    - We will provide an auto-upgrade script which translates the old syntax to the new syntax.
    - These upgrades must be cumulative, so that multiple upgrades can be applied sequentially, possibly with a testing cycle in-between.
    - Upgrades may be "rolled back" (although changes made to a project in the intervening time may be lost).


<span id="pull-requests"></span>
##### Pull requests
- Spell guides, api documetnation and examples are all shipped as part of the spell runtime.
- These are tied to the particular [spell language version](#spell-language-versioning) and [spell app version](#spell-app-version).
- Users in local-development mode may live-edit the above using the spell editor or other tools -- the spell UI will show their modified version by default.
    - **TODO**: Do we provide a different UI for the modified versions, so
- Pull requests may be submitted for an old versions of the language or the app.



<span id="spell-app-versioning"></span>
### Spell app versioning
- The spell app is separate from the language...


<span id="user-versioning"></span>
### User project versioning
- **TODO**: figure this out!!
- We want a simple, unidirectional versioning system for user projects:
    - Major version -- starts at 1
    - Minor version -- starts at 0
    - Patch version is sequential commit number.
