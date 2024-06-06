import { Context, Plugin, PluginInitParams, PublicAPI, Query, Result } from "@wox-launcher/wox-plugin"
import { getSounds, Sound } from "./sound"
import play, { Player } from "./player"

let api: PublicAPI
let sounds: Sound[]
const playingHandles: Record<string, Player> = {}
const playingCount: Record<string, number> = {}

async function refresh(ctx: Context, query: Query) {
  await api.ChangeQuery(ctx, {
    QueryType: query.Type,
    QueryText: query.RawQuery,
    QuerySelection: query.Selection
  })
}

// exit all playing sounds when the nodejs process exits
process.on("exit", () => {
  for (const sound in playingHandles) {
    playingHandles[sound].stop()
  }
})

export const plugin: Plugin = {
  init: async (ctx: Context, initParams: PluginInitParams) => {
    api = initParams.API
    sounds = getSounds()
    await api.Log(ctx, "Info", `Loaded ${sounds.length} sound groups`)
    const playingCountStr = await api.GetSetting(ctx, "playingCount")
    if (playingCountStr) {
      Object.assign(playingCount, JSON.parse(playingCountStr))
    }
  },

  query: async (ctx: Context, query: Query): Promise<Result[]> => {
    const results: Result[] = []

    for (let i = 0; i < sounds.length; i++) {
      const sound = sounds[i]
      if (sound.Name.toLowerCase().includes(query.Search.toLowerCase()) ||
        sound.Group.toLowerCase().includes(query.Search.toLowerCase()) ||
        query.Search === "") {
        results.push({
          Title: sound.Name,
          SubTitle: sound.Group + `${playingHandles[sound.Name] ? " - playing" : ""}`,
          Icon: {
            ImageType: "relative",
            ImageData: `${playingHandles[sound.Name] ? "images/play.png" : "images/app.png"}`
          },
          Score: sounds.length - i + (playingHandles[sound.Name] ? 10000000 : 0) + (playingCount[sound.Name] || 0) * 100,
          Actions: [
            {
              Name: "Play or pause",
              PreventHideAfterAction: true,
              Action: async () => {
                if (playingHandles[sound.Name]) {
                  await api.Log(ctx, "Info", `Stopping ${sound.Name}`)
                  playingHandles[sound.Name].stop()
                  delete playingHandles[sound.Name]
                  await refresh(ctx, query)
                  return
                }

                await api.Log(ctx, "Info", `Playing ${sound.Name}`)
                playingHandles[sound.Name] = play(sound.Path)
                playingCount[sound.Name] = (playingCount[sound.Name] || 0) + 1
                await api.SaveSetting(ctx, "playingCount", JSON.stringify(playingCount), false)
                await refresh(ctx, query)
              }
            }
          ]
        })
      }
    }

    return results
  }
}
