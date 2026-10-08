import { describe, expect, it } from "vite-plus/test"

import { I18n } from "./I18n"

////////////////
// ## Strings
////////////////

describe("I18n.t()", () => {
  it("ships the en pack and interpolates {name}", () => {
    const i18n = new I18n({ locale: "en-US" })
    expect(i18n.t("noResults")).toBe("No results found.")
    expect(i18n.t("addItem", { value: "Apples" })).toBe("Add Apples")
    expect(i18n.t("addItem")).toBe("Add {value}")
    expect(i18n.t("addItem", { other: 1 })).toBe("Add {value}")
  })

  it("falls back locale -> language -> en -> key", () => {
    const i18n = new I18n({ locale: "pt-BR" })
    i18n.register("pt", { close: "Fechar", cancel: "Cancelar" })
    i18n.register("pt-BR", { cancel: "Cancelar (BR)" })
    expect(i18n.t("cancel")).toBe("Cancelar (BR)")
    expect(i18n.t("close")).toBe("Fechar")
    expect(i18n.t("ok")).toBe("OK")
    expect(i18n.t("unknown.key")).toBe("unknown.key")
    expect(i18n.has("unknown.key")).toBe(false)
  })
})

describe("I18n.register()", () => {
  it("merges into an existing pack", () => {
    const i18n = new I18n({ locale: "en" })
    i18n.register("en", { close: "Dismiss" })
    expect(i18n.t("close")).toBe("Dismiss")
    expect(i18n.t("cancel")).toBe("Cancel")
  })
})

describe("I18n.registerDefaults()", () => {
  it("scopes component texts:  two defaults under one key don't collide", () => {
    const i18n = new I18n({ locale: "es" })
    i18n.registerDefaults({ label: "Table" }, "ui-table")
    i18n.registerDefaults({ label: "Breadcrumb" }, "ui-breadcrumb")
    expect(i18n.t("label", undefined, "ui-table")).toBe("Table")
    expect(i18n.t("label", undefined, "ui-breadcrumb")).toBe("Breadcrumb")
    // unscoped:  the first family's default
    expect(i18n.t("label")).toBe("Table")
    // a shared translation covers both;  a scoped one wins for its component
    i18n.register("es", { label: "Etiqueta" })
    i18n.register("es", { label: "Migas" }, "ui-breadcrumb")
    expect(i18n.t("label", undefined, "ui-table")).toBe("Etiqueta")
    expect(i18n.t("label", undefined, "ui-breadcrumb")).toBe("Migas")
    expect(i18n.has("label", "ui-table")).toBe(true)
  })

  it("keeps defaults below every registered string, English included, in any order", () => {
    const i18n = new I18n({ locale: "fr" })
    i18n.register("en", { remove: "Delete" })
    i18n.registerDefaults({ remove: "Remove", dismiss: "Dismiss" }, "ui-label")
    expect(i18n.t("remove", undefined, "ui-label")).toBe("Delete")
    expect(i18n.t("dismiss", undefined, "ui-label")).toBe("Dismiss")
    i18n.register("en", { close: "Shut" })
    expect(i18n.t("close")).toBe("Shut")
    // a new version of the same component (hot reload) replaces its defaults
    i18n.registerDefaults({ dismiss: "Hide" }, "ui-label")
    expect(i18n.t("dismiss", undefined, "ui-label")).toBe("Hide")
  })
})

////////////////
// ## Locale formatting
////////////////

describe("I18n.formatNumber() / formatDate()", () => {
  it("formats dates and numbers for the locale", () => {
    const i18n = new I18n({ locale: "de-DE" })
    expect(i18n.formatNumber(1234.5)).toBe("1.234,5")
    expect(i18n.formatDate(new Date(Date.UTC(2026, 8, 28, 12)), { dateStyle: "short", timeZone: "UTC" })).toBe(
      "28.09.26"
    )
  })
})

describe("I18n.weekdays() / months()", () => {
  it("lists weekdays (Sunday first) and months", () => {
    const i18n = new I18n({ locale: "en-US" })
    expect(i18n.weekdays()).toEqual(["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"])
    expect(i18n.months("short").slice(0, 3)).toEqual(["Jan", "Feb", "Mar"])
    expect(new I18n({ locale: "fr" }).months()[0]).toBe("janvier")
  })
})

describe("I18n.firstDayOfWeek() / displayName()", () => {
  it("knows the first day of the week and display names", () => {
    expect(new I18n({ locale: "en-US" }).firstDayOfWeek()).toBe(0)
    expect(new I18n({ locale: "en-GB" }).firstDayOfWeek()).toBe(1)
    expect(new I18n({ locale: "en" }).displayName("region", "DE")).toBe("Germany")
  })
})
