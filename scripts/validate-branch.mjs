import process from 'node:process'
import { execSync } from 'node:child_process'

const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim()

const allowed = /^(?:main|develop|(?:feature|fix|release|chore|docs)\/.+)$/

if (!allowed.test(branch)) {
  console.error(`
  ✖  Invalid branch name: "${branch}"

     Allowed patterns:
       main
       develop
       feature/<name>   e.g. feature/middleware-support
       fix/<name>       e.g. fix/listener-leak
       release/<name>   e.g. release/1.2.0
       chore/<name>     e.g. chore/update-deps
       docs/<name>      e.g. docs/api-reference
`)
  process.exit(1)
}
