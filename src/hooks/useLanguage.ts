import { useAppStore } from '../store/appStore'

interface Named {
  name: string
  nameNL: string
}

export function useLanguage() {
  const language = useAppStore(s => s.language)
  const setLanguage = useAppStore(s => s.setLanguage)

  /** Returns the display name for an exercise or template based on current language */
  const exName = (item: Named | undefined | null, fallback = ''): string => {
    if (!item) return fallback
    return language === 'en' ? item.name : item.nameNL
  }

  return { language, setLanguage, exName }
}
