import { afterAll, describe, expect, test } from "vite-plus/test"
import { flush } from "solid-js"
import { render } from "@solidjs/web"

import { UI } from "spell-ui/core"
import { appTexts } from "spell-app/app/ui/AppTexts"
import { uiReady } from "spell-app/app/solid/loadUI"
import { TypeExplorer } from "spell-app/app/solid/TypeExplorer"

/**
 * The editor in Spanish (epic `spanish` P13):
 * a page whose `lang` is `es` reads every text of the app in Spanish, through Spell UI's `UI.i18n`,
 * once `appTexts.load()` has fetched the Spanish chunk.
 * - Its own file:  the page's language is page-wide, and Spell UI keeps Spanish once it has loaded it.
 * - English, under node:  `AppTexts.test.ts`.
 */

// the page's language, before anything reads a text
const pageLang = document.documentElement.lang
document.documentElement.lang = "es"
afterAll(() => {
  document.documentElement.lang = pageLang
})

describe("appTexts, on a page in Spanish", () => {
  test("English until the Spanish has loaded;  then Spanish, through `UI.i18n`", async () => {
    expect(appTexts.text("save")).toBe("Save")
    await appTexts.load()
    expect(appTexts.lang).toBe("es")
    expect(appTexts.text("save")).toBe("Guardar")
    expect(appTexts.text("doIt", { action: "voltear" })).toBe("Hazlo:  voltear()")
    // a project group's words agree with the noun:  `el ejemplo`, `la guía`
    const examples = appTexts.groupWords({ type: "example" })
    expect(appTexts.text("createdApp", { ...examples, name: "Solitario" })).toBe("Se creó el ejemplo Solitario.")
    expect(appTexts.text("removedApp", appTexts.groupWords({ type: "guide" }))).toBe("Se borró la guía.")
  })

  test("the web components' own texts, and Spell UI's, are Spanish too", async () => {
    await appTexts.load()
    const { i18n } = await UI.load()
    expect(i18n.t("nothingToRun", undefined, "spell-app")).toBe("Dale a <spell-app> un project o un src que ejecutar.")
    expect(i18n.t("noProject", undefined, "spell-editor")).toBe("Dale a <spell-editor> un project que editar.")
    // Spell UI's shared text, which `<Chooser>` reads for its Cancel button
    expect(i18n.t("cancel")).toBe("Cancelar")
  })

  test("a pane draws in Spanish:  the Type Explorer with nothing run yet", async () => {
    await uiReady
    await appTexts.load()
    const host = document.createElement("div")
    document.body.append(host)
    const dispose = render(
      () => <TypeExplorer tree={undefined} onOpen={() => {}} loadDetails={async () => null} />,
      host
    )
    flush()
    expect(host.textContent).toBe("Ejecuta el proyecto para ver sus ámbitos.")
    dispose()
    host.remove()
  })
})
