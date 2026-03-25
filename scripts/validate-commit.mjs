import { readFileSync } from 'node:fs'
import process from 'node:process'

const msgFile = process.argv[2]
if (!msgFile) {
  console.error('✖  Commit message file path is missing. Expected it as process.argv[2].')
  process.exit(1)
}
const msg = readFileSync(msgFile, 'utf8').trim()

// Ignore merge commits and fixup commits
if (msg.startsWith('Merge ') || msg.startsWith('fixup!') || msg.startsWith('squash!')) {
  process.exit(0)
}

// Expected format: <gitmoji> <type> : <description>
// e.g. ✨ feature : add new feature
//      🐛 fix : resolve memory leak in store
const pattern = /^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F) +\w+ : .+/u

if (!pattern.test(msg)) {
  console.error(`
  ✖  Invalid commit message format.

     Expected : <gitmoji> <type> : <description>
     Example  : ✨ feature : add new feature
                🐛 fix : resolve memory leak in store
                📝 docs : update README

     Got      : "${msg}"
`)
  process.exit(1)
}
