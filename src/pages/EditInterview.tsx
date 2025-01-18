import { useParams, Navigate } from 'react-router-dom';
import { InterviewForm } from '../components/InterviewForm';
import { useInterviewStore } from '../store/interviewStore';

export function EditInterview() {
  const { id } = useParams<{ id: string }>();
  const interview = useInterviewStore((state) => state.getInterviewById(id!));

  if (!interview) {
    return <Navigate to="/" replace />;
  }

  return <InterviewForm initialData={interview} isEditing />;
}