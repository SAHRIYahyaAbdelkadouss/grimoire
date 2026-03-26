import { readFileSync } from 'node:fs'
import process from 'node:process'

const msgFile = process.argv[2]
if (!msgFile) {
  console.error('✖  Commit message file path is missing. Expected it as process.argv[2].')
  process.exit(1)
}
let msg
try {
  msg = readFileSync(msgFile, 'utf8').trim()
} catch (err) {
  console.error(
    `✖  Failed to read commit message file "${msgFile}": ${err instanceof Error ? err.message : String(err)}`,
  )
  process.exit(1)
}

// Ignore merge/fixup/squash commits — use exit code 2 as a custom "skip remaining hooks" sentinel,
// which is interpreted by the .husky/commit-msg wrapper (mapping 2 → 0) rather than by Git itself.
if (msg.startsWith('Merge ') || msg.startsWith('fixup!') || msg.startsWith('squash!')) {
  process.exit(2)
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
