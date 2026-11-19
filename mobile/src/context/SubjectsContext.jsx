import React, { createContext, useContext, useState } from 'react';
import { INITIAL_SUBJECTS } from '../data/mockData';

const SubjectsContext = createContext();

export function SubjectsProvider({ children }) {
  const [subjects, setSubjects] = useState(INITIAL_SUBJECTS);

  const addSubject = ({ title, room }) => {
    const created = {
      id: `icinf-${Date.now()}`,
      title: title.trim(),
      room: room?.trim() || 'Sala por asignar · Campus Chiloé',
      professor: 'Docente ULagos',
      schedule: 'Horario semestral',
      color: '#FAD9CF',
      sessions: [],
    };
    setSubjects((prev) => [created, ...prev]);
    return created;
  };

  const saveSessionToSubject = (subjectId, { topic, segments }) => {
    const newSession = {
      id: `ses-${Date.now()}`,
      date: new Date().toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' }),
      topic: topic.trim() || 'Cátedra registrada en vivo',
      segments,
    };

    setSubjects((prev) =>
      prev.map((sub) =>
        sub.id === subjectId
          ? { ...sub, sessions: [newSession, ...(sub.sessions || [])] }
          : sub
      )
    );
  };

  return (
    <SubjectsContext.Provider value={{ subjects, addSubject, saveSessionToSubject }}>
      {children}
    </SubjectsContext.Provider>
  );
}

export const useSubjects = () => useContext(SubjectsContext);
