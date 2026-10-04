import { describe, expect, it } from "vite-plus/test"

import { MD } from "$/markdown"

describe("toHTML() options", () => {
  it("GFM autolinks:  on by default, off on request", () => {
    expect(MD.toHTML("see www.example.com")).toBe('<p>see <a href="http://www.example.com">www.example.com</a></p>')
    expect(MD.toHTML("see www.example.com", { autolinks: false })).toBe("<p>see www.example.com</p>")
  })

  it("GFM tagfilter:  on by default, off on request", () => {
    expect(MD.toHTML("<script>x</script>")).toBe("&lt;script>x&lt;/script>")
    expect(MD.toHTML("<script>x</script>", { tagfilter: false })).toBe("<script>x</script>")
  })

  it("references can be used above their definition", () => {
    expect(MD.toHTML("[x]\n\n[x]: /there")).toBe('<p><a href="/there">x</a></p>')
  })
})
