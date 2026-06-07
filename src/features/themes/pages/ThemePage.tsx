import Header from '@/app/layout/Header'
import PageWrapper from '@/app/layout/PageWrapper'
import ThemePicker from '@/components/ThemePicker'

export default function ThemePage() {
  return (
    <>
      <Header title="Thema's" showBack />
      <PageWrapper className="max-w-6xl">
        <ThemePicker />
      </PageWrapper>
    </>
  )
}
