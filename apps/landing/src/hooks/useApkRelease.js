import { useEffect, useState } from 'react'

const DEFAULT_FILENAME = 'tapg-maintenance-latest.apk'

function joinBasePath(basePath, filename) {
  const normalizedBasePath = `${basePath || '/apk'}`.replace(/\/+$/, '')
  return `${normalizedBasePath}/${filename}`.replace(/([^:]\/)\/+/g, '$1')
}

async function checkFile(url) {
  try {
    const response = await fetch(url, { method: 'HEAD', cache: 'no-store' })
    if (response.ok) {
      return {
        available: true,
        sizeBytes: Number(response.headers.get('content-length')) || null,
      }
    }
  } catch {
    return { available: false, sizeBytes: null }
  }

  return { available: false, sizeBytes: null }
}

export function useApkRelease() {
  const [state, setState] = useState({
    loading: true,
    available: false,
    filename: DEFAULT_FILENAME,
    version: null,
    updatedAt: null,
    sizeBytes: null,
    checksum: null,
    notes: [],
    installNotes: [],
    downloadUrl: joinBasePath(import.meta.env.VITE_APK_BASE_PATH, DEFAULT_FILENAME),
  })

  useEffect(() => {
    let active = true
    const basePath = import.meta.env.VITE_APK_BASE_PATH || '/apk'

    async function loadRelease() {
      const metadataUrl = joinBasePath(basePath, 'release-notes.json')

      try {
        const metadataResponse = await fetch(metadataUrl, { cache: 'no-store' })
        if (metadataResponse.ok) {
          const metadata = await metadataResponse.json()
          const filename = metadata.filename || DEFAULT_FILENAME
          const downloadUrl = joinBasePath(basePath, filename)
          const fileStatus = await checkFile(downloadUrl)

          if (!active) return

          setState({
            loading: false,
            available: fileStatus.available,
            filename,
            version: metadata.version || null,
            updatedAt: metadata.updated_at || null,
            sizeBytes: metadata.filesize_bytes || fileStatus.sizeBytes || null,
            checksum: metadata.checksum_sha256 || null,
            notes: Array.isArray(metadata.notes) ? metadata.notes : [],
            installNotes: Array.isArray(metadata.install_notes) ? metadata.install_notes : [],
            downloadUrl,
          })
          return
        }
      } catch {
        // Ignore metadata failures and continue with fallback probing.
      }

      const fallbackUrl = joinBasePath(basePath, DEFAULT_FILENAME)
      const fallbackStatus = await checkFile(fallbackUrl)

      if (!active) return

      setState((current) => ({
        ...current,
        loading: false,
        available: fallbackStatus.available,
        sizeBytes: fallbackStatus.sizeBytes,
        downloadUrl: fallbackUrl,
      }))
    }

    loadRelease()

    return () => {
      active = false
    }
  }, [])

  return state
}
