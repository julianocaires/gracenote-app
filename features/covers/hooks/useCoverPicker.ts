import { useState } from 'react'
import * as ImagePicker from 'expo-image-picker'
import { coversService } from '../services/covers.service'
import type { Cover } from '../../../shared/types'
export function useCoverPicker(userId: string) {
  const [systemCovers, setSystemCovers] = useState<Cover[]>([]); const [userCovers, setUserCovers] = useState<Cover[]>([]); const [loading, setLoading] = useState(false)
  async function load() { setLoading(true); try { const [sys, usr] = await Promise.all([coversService.getSystemCovers(), userId ? coversService.getUserCovers(userId) : Promise.resolve([])]); setSystemCovers(sys); setUserCovers(usr) } finally { setLoading(false) } }
  async function pickFromGallery(): Promise<Cover | null> {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [4, 3], quality: 0.7 })
    if (result.canceled || !userId) return null; const cover = await coversService.uploadFromDevice(userId, result.assets[0].uri); setUserCovers((p) => [cover, ...p]); return cover
  }
  async function pickFromCamera(): Promise<Cover | null> {
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [4, 3], quality: 0.7 })
    if (result.canceled || !userId) return null; const cover = await coversService.uploadFromDevice(userId, result.assets[0].uri); setUserCovers((p) => [cover, ...p]); return cover
  }
  return { systemCovers, userCovers, loading, load, pickFromGallery, pickFromCamera }
}
