import { createHash } from 'node:crypto'
import { createReadStream, promises as fs } from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const releaseDir = path.join(rootDir, 'release')
const version = JSON.parse(await fs.readFile(path.join(rootDir, 'package.json'), 'utf8')).version
const electronVersion = '42.3.0'
const expectedSha256 = '92b0ca0c9c18ed90166918a4ac1970266c4fa967aee9277031b3b250b905526e'
const zipFile = process.argv[2] && path.resolve(process.argv[2])
const outputDir = path.join(releaseDir, `ham-checkin-${version}-linux-loong64`)
const stagingDir = path.join(releaseDir, `.ham-checkin-loong64-staging-${process.pid}`)

if (process.platform !== 'linux' || process.arch !== 'loong64') {
  throw new Error('Run this packaging script on a native Linux loong64 machine.')
}
if (!zipFile) {
  throw new Error(`Usage: npm run dist:loong64 -- /path/to/electron-v${electronVersion}-linux-loong64.zip`)
}
if (await fs.stat(outputDir).then(() => true, () => false)) {
  throw new Error(`Output already exists: ${outputDir}`)
}
if (await fs.stat(stagingDir).then(() => true, () => false)) {
  throw new Error(`Staging directory already exists: ${stagingDir}`)
}
if (!(await fs.stat(path.join(rootDir, 'dist', 'index.html')).then(() => true, () => false))) {
  throw new Error('dist/index.html is missing. Run npm run build first.')
}

const hash = createHash('sha256')
for await (const chunk of createReadStream(zipFile)) hash.update(chunk)
if (hash.digest('hex') !== expectedSha256) {
  throw new Error(`Electron archive checksum mismatch: ${zipFile}`)
}

const run = (command, args, cwd) => {
  const result = spawnSync(command, args, { cwd, stdio: 'inherit' })
  if (result.error) throw result.error
  if (result.status !== 0) throw new Error(`${command} exited with status ${result.status}`)
}

await fs.mkdir(releaseDir, { recursive: true })
await fs.mkdir(stagingDir)
try {
  run('unzip', ['-q', zipFile, '-d', stagingDir], rootDir)
  const appDir = path.join(stagingDir, 'resources', 'app')
  await fs.mkdir(path.join(appDir, 'build'), { recursive: true })
  for (const name of ['dist', 'electron', 'server']) {
    await fs.cp(path.join(rootDir, name), path.join(appDir, name), { recursive: true })
  }
  await fs.copyFile(path.join(rootDir, 'build', 'icon.png'), path.join(appDir, 'build', 'icon.png'))
  for (const name of ['package.json', 'package-lock.json']) {
    await fs.copyFile(path.join(rootDir, name), path.join(appDir, name))
  }
  run('npm', ['ci', '--omit=dev', '--ignore-scripts', '--no-audit'], appDir)
  await fs.rename(stagingDir, outputDir)
  console.log(`Electron ${electronVersion} portable directory: ${outputDir}`)
  console.log(`Run: ${path.join(outputDir, 'electron')}`)
} catch (error) {
  await fs.rm(stagingDir, { recursive: true, force: true })
  throw error
}
