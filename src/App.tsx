import { AppLayout } from '@/components/layout/AppLayout'
import { LandingLayout } from '@/components/layout/LandingLayout'
import { seedStorage } from '@/lib/storage'
import { AnalysisPage } from '@/pages/AnalysisPage'
import { GeneratorPage } from '@/pages/GeneratorPage'
import { HomePage } from '@/pages/HomePage'
import { MatchingsPage } from '@/pages/MatchingsPage'
import { ResumePage } from '@/pages/ResumePage'
import { RestylePage } from '@/pages/RestylePage'
import { ResumeVersionsPage } from '@/pages/ResumeVersionsPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

seedStorage()

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<LandingLayout />}>
          <Route path="/" element={<HomePage />} />
        </Route>
        <Route element={<AppLayout />}>
          <Route path="/curriculo" element={<ResumePage />} />
          <Route path="/curriculo/versao/:versionId" element={<RestylePage />} />
          <Route path="/analises" element={<MatchingsPage />} />
          <Route path="/analise/:matchId" element={<AnalysisPage />} />
          <Route path="/analise/:matchId/otimizar" element={<GeneratorPage />} />
          <Route path="/curriculos" element={<ResumeVersionsPage />} />
          <Route path="/configuracoes" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
