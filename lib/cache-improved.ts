import fs from 'fs/promises'
import path from 'path'

const CACHE_DIR = path.join(process.cwd(), '.cache')
const CACHE_DURATION = 30 * 60 * 1000 // 30 minutes

interface CacheEntry<T> {
  data: T
  timestamp: number
  etag?: string
}

export async function getCache<T>(key: string): Promise<T | null> {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true })
    const filePath = path.join(CACHE_DIR, `${key}.json`)
    const content = await fs.readFile(filePath, 'utf-8')
    const cached: CacheEntry<T> = JSON.parse(content)
    
    if (Date.now() - cached.timestamp > CACHE_DURATION) {
      await fs.unlink(filePath).catch(() => {})
      return null
    }
    
    return cached.data
  } catch {
    return null
  }
}

export async function setCache<T>(key: string, data: T, etag?: string): Promise<void> {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true })
    const filePath = path.join(CACHE_DIR, `${key}.json`)
    const cacheEntry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      etag
    }
    await fs.writeFile(filePath, JSON.stringify(cacheEntry, null, 2))
  } catch (error) {
    console.error('Cache write error:', error)
  }
}

export async function getCacheWithETag<T>(key: string): Promise<{ data: T; etag?: string } | null> {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true })
    const filePath = path.join(CACHE_DIR, `${key}.json`)
    const content = await fs.readFile(filePath, 'utf-8')
    const cached: CacheEntry<T> = JSON.parse(content)
    
    if (Date.now() - cached.timestamp > CACHE_DURATION) {
      await fs.unlink(filePath).catch(() => {})
      return null
    }
    
    return { data: cached.data, etag: cached.etag }
  } catch {
    return null
  }
}
