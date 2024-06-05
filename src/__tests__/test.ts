import { getSounds } from "../sound"
import { plugin } from "../index"
import { Context, PublicAPI, Query } from "@wox-launcher/wox-plugin"

test("get sounds", async () => {
  const sounds = getSounds()
  expect(sounds.length).toBeGreaterThan(999)
})

test("query", async () => {
  const ctx = {} as Context
  const query = {
    Env: { "ActiveWindowTitle": "" },
    RawQuery: "moodist ",
    Selection: { Type: "text", Text: "", FilePaths: [] },
    Type: "input",
    Search: "",
    TriggerKeyword: "moodist",
    Command: "",
    IsGlobalQuery(): boolean {
      return false
    }
  } as Query

  await plugin.init(ctx, {
    PluginDirectory: "", API: {
      Log: (ctx, level, message) => {
        console.log(level, message)
      }
    } as PublicAPI
  })
  const results = await plugin.query(ctx, query)
  expect(results.length).toBeGreaterThan(0)
})
