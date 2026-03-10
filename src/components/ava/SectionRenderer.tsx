'use client';

import { Section } from '@/lib/services/ava.service';
import { TextSection } from './sections/TextSection';
import { VideoSection } from './sections/VideoSection';
import { FileSection } from './sections/FileSection';
import { QuizSection } from './sections/QuizSection';
import { CaseStudySection } from './sections/CaseStudySection';
import { MindmapSection } from './sections/MindmapSection';
import { FinalMessageSection } from './sections/FinalMessageSection';
import { DashboardSection } from './sections/DashboardSection';
import { ExamBankSection } from './sections/ExamBankSection';

interface Props {
  section: Section;
  moduleId?: string;
}

export function SectionRenderer({ section, moduleId }: Props) {
  switch (section.type) {
    case 'TEXT':
    case 'STORYTELLING':
      return <TextSection section={section} />;
    case 'VIDEO':
      return <VideoSection section={section} />;
    case 'FILE':
    case 'SLIDES':
      return <FileSection section={section} />;
    case 'QUIZ':
      return <QuizSection section={section} />;
    case 'CASE_STUDY':
      return <CaseStudySection section={section} />;
    case 'MINDMAP':
      return <MindmapSection section={section} />;
    case 'FINAL_MESSAGE':
      return <FinalMessageSection section={section} />;
    case 'DASHBOARD':
      return <DashboardSection section={section} />;
    case 'EXAM_BANK':
      return <ExamBankSection section={section} moduleId={moduleId} />;
    default:
      return (
        <div className="rounded border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-400">
          Tipo de seção desconhecido: {section.type}
        </div>
      );
  }
}
