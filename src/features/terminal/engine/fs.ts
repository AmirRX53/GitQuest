// Virtual in-memory filesystem for the terminal simulator.
// Pure data + pure functions so scenarios reset by replacing state.

export interface VFile {
  type: 'file'
  content: string
}

export interface VDir {
  type: 'dir'
  children: Map<string, VNode>
}

export type VNode = VFile | VDir

export interface Vfs {
  root: VDir
  cwd: string
}

/** Create a file node. */
export function file(content = ''): VFile {
  return { type: 'file', content }
}

/** Create a directory node from name -> child entries. */
export function dir(entries: Record<string, VNode> = {}): VDir {
  const children = new Map<string, VNode>()
  for (const [name, node] of Object.entries(entries)) {
    children.set(name, node)
  }
  return { type: 'dir', children }
}

/** Deep-clone a vfs (Maps included). */
export function cloneVfs(vfs: Vfs): Vfs {
  function cloneNode(node: VNode): VNode {
    if (node.type === 'file') return { type: 'file', content: node.content }
    const children = new Map<string, VNode>()
    for (const [name, child] of node.children) children.set(name, cloneNode(child))
    return { type: 'dir', children }
  }
  return { root: cloneNode(vfs.root) as VDir, cwd: vfs.cwd }
}

export function splitPath(path: string): string[] {
  return path.split('/').filter((p) => p !== '' && p !== '.')
}

export function nameOf(path: string): string {
  const parts = splitPath(path)
  return parts.length === 0 ? '/' : parts[parts.length - 1]
}

/** Resolve a (possibly relative) path against cwd. Returns null on invalid ../ climbing. */
export function resolvePath(vfs: Vfs, target: string): string | null {
  if (target === '') return null
  const parts = target.startsWith('/') ? splitPath(target) : [...splitPath(vfs.cwd), ...splitPath(target)]
  const out: string[] = []
  for (const part of parts) {
    if (part === '..') {
      if (out.length === 0) return null
      out.pop()
    } else {
      out.push(part)
    }
  }
  return '/' + out.join('/')
}

/** Get the node at an absolute path (null if missing or walking through a file). */
export function getNode(vfs: Vfs, abs: string): VNode | null {
  let node: VNode = vfs.root
  for (const part of splitPath(abs)) {
    if (node.type !== 'dir') return null
    const next = node.children.get(part)
    if (!next) return null
    node = next
  }
  return node
}

/** Get the directory node at an absolute path (null unless it exists and is a dir). */
export function getDir(vfs: Vfs, abs: string): VDir | null {
  const node = getNode(vfs, abs)
  return node && node.type === 'dir' ? node : null
}

/** Read a file's content, or null if the path is not an existing file. */
export function readFile(vfs: Vfs, abs: string): string | null {
  const node = getNode(vfs, abs)
  return node && node.type === 'file' ? node.content : null
}

/** Create or overwrite a file at an absolute path. Returns error string or null. */
export function writeFile(vfs: Vfs, abs: string, content: string): string | null {
  const parentPath = abs.slice(0, abs.lastIndexOf('/')) || '/'
  const name = nameOf(abs)
  const parent = getDir(vfs, parentPath)
  if (!parent) return `path: no such directory '${parentPath}'`
  const existing = parent.children.get(name)
  if (existing && existing.type === 'dir') return `path: '${abs}' is a directory`
  parent.children.set(name, { type: 'file', content })
  return null
}

/** Remove a file or directory (recursively) at an absolute path. */
export function removeNode(vfs: Vfs, abs: string): string | null {
  const parentPath = abs.slice(0, abs.lastIndexOf('/')) || '/'
  const name = nameOf(abs)
  const parent = getDir(vfs, parentPath)
  if (!parent) return `no such file or directory: ${abs}`
  if (!parent.children.has(name)) return `no such file or directory: ${abs}`
  parent.children.delete(name)
  return null
}

/** List entries of a directory as [name, node] pairs, sorted (dirs first). */
export function listDir(vfs: Vfs, abs: string): Array<[string, VNode]> {
  const d = getDir(vfs, abs)
  if (!d) return []
  return [...d.children.entries()].sort((a, b) => {
    const aDir = a[1].type === 'dir' ? 0 : 1
    const bDir = b[1].type === 'dir' ? 0 : 1
    return aDir - bDir || a[0].localeCompare(b[0])
  })
}

/** Copy a file or directory tree from one absolute path to another. */
export function copyNode(vfs: Vfs, from: string, to: string): string | null {
  const node = getNode(vfs, from)
  if (!node) return `no such file or directory: ${from}`
  const parentPath = to.slice(0, to.lastIndexOf('/')) || '/'
  const name = nameOf(to)
  const parent = getDir(vfs, parentPath)
  if (!parent) return `no such directory: ${parentPath}`
  const clone = structuredCloneNode(node)
  parent.children.set(name, clone)
  return null
}

// ─── Setup helpers ──────────────────────────────────────────────────────────

/** Create a vfs from a simple JSON spec: { cwd, tree: { name: contentOrNested } }. The tree is created under cwd. */
export type TreeNode = string | { [name: string]: TreeNode }

export function createVfsFromSpec(spec: string): Vfs {
  const parsed = JSON.parse(spec) as { cwd?: string; tree?: Record<string, TreeNode> }
  const root = dir()
  const cwd = parsed.cwd ?? '/'
  const build = (entries: Record<string, TreeNode>, node: VDir): void => {
    for (const [name, value] of Object.entries(entries)) {
      if (typeof value === 'string') {
        node.children.set(name, file(value))
      } else if (value && typeof value === 'object') {
        const child = dir()
        node.children.set(name, child)
        build(value, child)
      }
    }
  }
  // Create the cwd path, then build the tree inside it.
  let node: VDir = root
  for (const part of splitPath(cwd)) {
    let next = node.children.get(part)
    if (!next || next.type !== 'dir') {
      next = dir()
      node.children.set(part, next)
    }
    node = next
  }
  build(parsed.tree ?? {}, node)
  return { root, cwd }
}

function structuredCloneNode(node: VNode): VNode {
  if (node.type === 'file') return { type: 'file', content: node.content }
  const children = new Map<string, VNode>()
  for (const [name, child] of node.children) children.set(name, structuredCloneNode(child))
  return { type: 'dir', children }
}
